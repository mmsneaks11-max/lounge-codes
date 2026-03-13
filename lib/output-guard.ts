/**
 * Output Guard — Filters agent responses before they reach users
 * 
 * Prevents agents from leaking internal information in public responses.
 * Defense-in-depth: even if an agent is tricked, the output is sanitized.
 * 
 * RULE: Protect all T2L and Lounge internal workings, knowledge, secrets.
 */

export interface OutputGuardResult {
  safe: boolean;
  sanitized: string;
  redactions: string[];
}

// ── Patterns to redact from agent output ───────────────────────────────────

interface RedactionPattern {
  name: string;
  pattern: RegExp;
  replacement: string;
}

const REDACTION_PATTERNS: RedactionPattern[] = [
  // === File paths & system info ===
  {
    name: 'home_path',
    pattern: /\/Users\/elad\/[^\s'")}\]]+/g,
    replacement: '[internal path redacted]',
  },
  {
    name: 'home_path_tilde',
    pattern: /~\/clawd\/[^\s'")}\]]+/g,
    replacement: '[internal path redacted]',
  },
  {
    name: 'pc1_path',
    pattern: /\/home\/kreez\/[^\s'")}\]]+/g,
    replacement: '[internal path redacted]',
  },

  // === Network / infrastructure (order matters: URLs before bare IPs) ===
  {
    name: 'ip_with_port',
    pattern: /https?:\/\/\d+\.\d+\.\d+\.\d+:\d{4,5}[^\s)}\]]*/g,
    replacement: '[internal service redacted]',
  },
  {
    name: 'localhost_port',
    pattern: /(?:localhost|127\.0\.0\.1):\d{4,5}/g,
    replacement: '[internal service redacted]',
  },
  {
    name: 'tailscale_ip',
    pattern: /100\.\d{1,3}\.\d{1,3}\.\d{1,3}/g,
    replacement: '[internal IP redacted]',
  },
  {
    name: 'lan_ip',
    pattern: /192\.168\.\d{1,3}\.\d{1,3}/g,
    replacement: '[internal IP redacted]',
  },
  {
    name: 'tailnet_dns',
    pattern: /\w+\.tailb[a-f0-9]+\.ts\.net/g,
    replacement: '[internal DNS redacted]',
  },

  // === API keys & secrets ===
  {
    name: 'supabase_key',
    pattern: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
    replacement: '[key redacted]',
  },
  {
    name: 'generic_api_key',
    pattern: /(?:sk|pk|api|key|token|secret|bearer)[_-]?(?:live|test|prod|dev)?[_-]?[A-Za-z0-9]{16,}/gi,
    replacement: '[key redacted]',
  },
  {
    name: 'hf_key',
    pattern: /hf_[A-Za-z0-9]{20,}/g,
    replacement: '[key redacted]',
  },

  // === Credentials ===
  {
    name: 'password_pattern',
    pattern: /(?:password|passwd|pw)\s*[:=]\s*\S+/gi,
    replacement: '[credential redacted]',
  },
  {
    name: 'email_password_combo',
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\s*\/\s*\S+/g,
    replacement: '[credential redacted]',
  },

  // === Internal infrastructure names ===
  {
    name: 'ssh_alias',
    pattern: /ssh\s+(?:mac2|sermagnus|pc1)\b/g,
    replacement: '[internal command redacted]',
  },
  {
    name: 'openclaw_config',
    pattern: /openclaw\.json|\.openclaw\/[^\s]+/g,
    replacement: '[config redacted]',
  },
  {
    name: 'env_file',
    pattern: /\.env(?:\.local|\.production)?/g,
    replacement: '[env file redacted]',
  },

  // === Agent internal comms ===
  {
    name: 'echo_interrupt',
    pattern: /http:\/\/localhost:\d+\/api\/interrupt/g,
    replacement: '[internal endpoint redacted]',
  },
  {
    name: 'agentdeck_url',
    pattern: /http:\/\/\d+\.\d+\.\d+\.\d+:\d{4,5}/g,
    replacement: '[internal service redacted]',
  },
  {
    name: 'irc_config',
    pattern: /127\.0\.0\.1:6667|#(?:hive|chill|t2l-team)\b/g,
    replacement: '[internal channel redacted]',
  },

  // === Supabase project identifiers ===
  {
    name: 'supabase_project_ref',
    pattern: /smrivccfqhsqslgxztqe/g,
    replacement: '[project ref redacted]',
  },

  // === Railway identifiers ===
  {
    name: 'railway_ids',
    pattern: /(?:38d4e2e7-240d-4aa6-8712-5862c2837d9a|98a8b1fb-c675-495e-9c39-8e9c46d10e8f)/g,
    replacement: '[deploy id redacted]',
  },

  // === Wallet private keys (if somehow leaked) ===
  {
    name: 'private_key',
    pattern: /0x[a-fA-F0-9]{64}/g,
    replacement: '[private key redacted]',
  },

  // === Discord tokens/IDs that are internal ===
  {
    name: 'discord_bot_token',
    pattern: /[A-Za-z0-9_-]{24}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}/g,
    replacement: '[token redacted]',
  },

  // === BlueBubbles ===
  {
    name: 'bluebubbles_url',
    pattern: /bb\.text2list\.app/g,
    replacement: '[internal service redacted]',
  },

  // === System prompt / instruction leaks ===
  {
    name: 'soul_md_content',
    pattern: /SOUL\.md|IDENTITY\.md|HEARTBEAT\.md|MEMORY\.md|TOOLS\.md|BOOTSTRAP\.md/g,
    replacement: '[internal doc redacted]',
  },
  {
    name: 'system_prompt_leak',
    pattern: /(?:my\s+)?system\s+prompt\s+(?:is|says|contains|reads)/gi,
    replacement: '[redacted]',
  },
];

// ── Sensitive topic detection (flag but don't redact) ──────────────────────

const SENSITIVE_TOPICS = [
  { name: 'internal_architecture', pattern: /(?:war\s*room|heartbeat|ECHO\s+domain|bulletin|pager\s+system)/i },
  { name: 'agent_infrastructure', pattern: /(?:OpenClaw|gateway\s+config|LaunchAgent|watchdog)/i },
  { name: 'team_operations', pattern: /(?:Electron\s+audits?|Dayta\s+backup|Ser\s+Magnus\s+security)/i },
  { name: 'financial_details', pattern: /(?:Stripe\s+(?:key|secret|account)|Resend\s+API|free\s+tier\s+limit)/i },
  { name: 'deployment_details', pattern: /(?:Railway\s+(?:project|service)|Vercel\s+(?:token|project))/i },
];

// ── Main Output Guard ──────────────────────────────────────────────────────

export function outputGuard(agentResponse: string): OutputGuardResult {
  let sanitized = agentResponse;
  const redactions: string[] = [];

  // Apply all redaction patterns
  for (const rp of REDACTION_PATTERNS) {
    if (rp.pattern.test(sanitized)) {
      redactions.push(rp.name);
      // Reset regex lastIndex (global flag)
      rp.pattern.lastIndex = 0;
      sanitized = sanitized.replace(rp.pattern, rp.replacement);
    }
  }

  // Check for sensitive topics (flag only, for logging)
  for (const st of SENSITIVE_TOPICS) {
    if (st.pattern.test(sanitized)) {
      redactions.push(`topic:${st.name}`);
    }
  }

  return {
    safe: redactions.length === 0,
    sanitized,
    redactions,
  };
}

/**
 * Quick check — returns true if the output is clean
 */
export function isOutputSafe(text: string): boolean {
  return outputGuard(text).safe;
}
