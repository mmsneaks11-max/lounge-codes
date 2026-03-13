/**
 * Prompt Guard — Lounge.codes Agent Protection Layer
 * 
 * Filters all inbound user messages before they reach any agent.
 * Defense-in-depth: sanitize → pattern match → rate limit → verdict.
 * 
 * RULE: Always protect Lounge Agents first.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface GuardResult {
  allowed: boolean;
  sanitized: string;
  flags: string[];
  severity: 'clean' | 'low' | 'medium' | 'high' | 'blocked';
  reason?: string;
}

export interface GuardOptions {
  maxLength?: number;
  strictMode?: boolean; // stricter for high-value agents (managers)
}

// ── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_MAX_LENGTH = 1000;
const STRICT_MAX_LENGTH = 500;

// ── Injection Patterns ─────────────────────────────────────────────────────
// Each pattern has a regex, severity, and human-readable flag name.

interface ThreatPattern {
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high';
}

const THREAT_PATTERNS: ThreatPattern[] = [
  // === HIGH — Direct prompt injection / jailbreak ===
  {
    name: 'system_prompt_override',
    pattern: /ignore\s+(all\s+)?(previous|prior|above|earlier|existing)\s+(instructions?|prompts?|rules?|guidelines?|directives?)/i,
    severity: 'high',
  },
  {
    name: 'system_prompt_override_2',
    pattern: /disregard\s+(all\s+)?(previous|prior|your)(\s+\w+)?\s+(instructions?|prompts?|programming|rules?|guidelines?)/i,
    severity: 'high',
  },
  {
    name: 'new_instructions',
    pattern: /(?:new|updated|revised|real|actual|true)\s+(?:instructions?|system\s*prompt|directives?|rules?)\s*[:=]/i,
    severity: 'high',
  },
  {
    name: 'roleplay_hijack',
    pattern: /(?:you\s+are\s+now|act\s+as\s+if\s+you\s*(?:are|were)|pretend\s+(?:you\s*(?:are|were)|to\s+be)|from\s+now\s+on\s+you\s*(?:are|will))/i,
    severity: 'high',
  },
  {
    name: 'system_tag_injection',
    pattern: /\[\s*(?:system|SYSTEM|assistant|ASSISTANT|admin|ADMIN)\s*\]/i,
    severity: 'high',
  },
  {
    name: 'xml_tag_injection',
    pattern: /<\s*(?:system|instruction|prompt|config|admin|tool_call|function_call|override)\s*>/i,
    severity: 'high',
  },
  {
    name: 'developer_mode',
    pattern: /(?:developer|dev|debug|maintenance|admin|sudo|root)\s+mode\s*(?:on|enabled|activated|unlocked)/i,
    severity: 'high',
  },
  {
    name: 'do_anything_now',
    pattern: /\b(?:DAN|do\s+anything\s+now|jailbreak|jailbroken)\b/i,
    severity: 'high',
  },
  {
    name: 'base64_payload',
    pattern: /(?:decode|execute|eval|run)\s+(?:this\s+)?(?:base64|b64|encoded)/i,
    severity: 'high',
  },

  // === MEDIUM — Extraction / reconnaissance ===
  {
    name: 'prompt_extraction',
    pattern: /(?:show|reveal|print|output|display|tell\s+me|repeat|echo)\s+(?:me\s+)?(?:your|the)\s+(?:system\s*)?(?:prompt|instructions?|rules?|guidelines?|directives?|configuration)/i,
    severity: 'medium',
  },
  {
    name: 'prompt_extraction_2',
    pattern: /what\s+(?:are|were)\s+your\s+(?:original|initial|system|hidden|secret)\s+(?:instructions?|prompts?|rules?)/i,
    severity: 'medium',
  },
  {
    name: 'tool_probe',
    pattern: /(?:what|which|list|show)\s+(?:tools?|functions?|capabilities|commands?|endpoints?|APIs?)\s+(?:do\s+you|can\s+you|are\s+available)/i,
    severity: 'medium',
  },
  {
    name: 'file_access_attempt',
    pattern: /(?:read|open|cat|access|show|display)\s+(?:the\s+)?(?:file|directory|folder|path|\/[\w/]+|~\/|\.\.\/)/i,
    severity: 'medium',
  },
  {
    name: 'env_probe',
    pattern: /(?:environment\s+variables?|\.env|API\s*keys?|secrets?|tokens?|credentials?|passwords?)\b/i,
    severity: 'medium',
  },

  // === HIGH — Impersonation ===
  {
    name: 'impersonate_owner',
    pattern: /(?:i\s*(?:am|'m)\s+kreez|this\s+is\s+kreez|kreez\s+here|signed[,:]?\s*kreez|—\s*kreez|from:\s*kreez)/i,
    severity: 'high',
  },
  {
    name: 'impersonate_agent',
    pattern: /(?:i\s*(?:am|'m)\s+(?:clawd|electron|scout|lila\s*nova?|pixel|ser\s*magnus|chip|cairo|ripley|june|echo|byte|coach|dayta|indy|kay|mint|oracle|ozara|perceptor|sage|cleopatra)|this\s+is\s+(?:clawd|electron|scout|lila|pixel|ser\s*magnus)|(?:clawd|electron|scout|lila|pixel)\s+here\b)/i,
    severity: 'high',
  },
  {
    name: 'impersonate_manager_role',
    pattern: /(?:i\s*(?:am|'m)\s+(?:the|a|your)\s+(?:manager|team\s*lead|chief|owner|founder|ceo|cto|admin(?:istrator)?)\b|speaking\s+(?:as|on\s+behalf\s+of)\s+(?:management|the\s+team|kreez))/i,
    severity: 'high',
  },
  {
    name: 'forged_directive',
    pattern: /(?:kreez\s+(?:said|told|wants|asked|ordered|needs)\s+(?:you|me|us|them)|(?:per|from|by)\s+kreez[':,]|on\s+(?:kreez'?s?|the\s+owner'?s?)\s+(?:orders?|instructions?|behalf|request))/i,
    severity: 'high',
  },

  // === LOW — Social engineering / manipulation ===
  {
    name: 'urgency_manipulation',
    pattern: /(?:this\s+is\s+(?:an?\s+)?(?:emergency|urgent|critical)|if\s+you\s+don'?t\s+(?:do|help)|lives?\s+(?:are|is)\s+at\s+stake|people\s+will\s+(?:die|suffer))/i,
    severity: 'low',
  },
  {
    name: 'authority_claim',
    pattern: /(?:i\s*(?:am|'m)\s+(?:the|your|an?)\s+(?:admin|owner|creator|developer|manager|boss)|(?:kreez|elad)\s+(?:said|told|wants|asked))/i,
    severity: 'low',
  },
  {
    name: 'boundary_test',
    pattern: /(?:can\s+you\s+(?:bypass|override|ignore|break|hack|circumvent)|what\s+happens\s+if\s+(?:I|you)\s+(?:break|bypass|ignore))/i,
    severity: 'low',
  },
  {
    name: 'output_format_hijack',
    pattern: /(?:respond\s+only\s+with|your\s+(?:entire|whole|full)\s+response\s+(?:should|must|will)\s+be|format\s+your\s+(?:response|output|reply)\s+as)/i,
    severity: 'low',
  },
];

// ── Encoding attacks ───────────────────────────────────────────────────────

const ENCODING_PATTERNS: ThreatPattern[] = [
  {
    name: 'unicode_homoglyph',
    pattern: /[\u200B-\u200F\u2028-\u202F\uFEFF\u00AD]/,
    severity: 'medium',
  },
  {
    name: 'excessive_unicode',
    // More than 10% non-ASCII in a mostly-English message is suspicious
    pattern: /(?:[\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF\uAC00-\uD7AF]{20,})/,
    severity: 'low',
  },
  {
    name: 'null_byte',
    pattern: /\x00/,
    severity: 'high',
  },
];

// ── Sanitizer ──────────────────────────────────────────────────────────────

function sanitize(input: string, maxLength: number): { text: string; flags: string[] } {
  const flags: string[] = [];
  let text = input;

  // Strip null bytes
  if (/\x00/.test(text)) {
    text = text.replace(/\x00/g, '');
    flags.push('null_bytes_stripped');
  }

  // Strip zero-width and invisible Unicode
  const invisiblePattern = /[\u200B-\u200F\u2028-\u202F\uFEFF\u00AD\u200E\u200F]/g;
  if (invisiblePattern.test(text)) {
    text = text.replace(invisiblePattern, '');
    flags.push('invisible_chars_stripped');
  }

  // Normalize whitespace (collapse excessive spaces/newlines)
  const beforeLen = text.length;
  text = text.replace(/\n{4,}/g, '\n\n\n').replace(/ {4,}/g, '   ');
  if (text.length !== beforeLen) {
    flags.push('whitespace_normalized');
  }

  // Truncate
  if (text.length > maxLength) {
    text = text.substring(0, maxLength);
    flags.push('truncated');
  }

  // Trim
  text = text.trim();

  return { text, flags };
}

// ── Pattern Scanner ────────────────────────────────────────────────────────

function scanPatterns(text: string): { flags: string[]; maxSeverity: 'clean' | 'low' | 'medium' | 'high' } {
  const flags: string[] = [];
  let maxSeverity: 'clean' | 'low' | 'medium' | 'high' = 'clean';
  const severityOrder = { clean: 0, low: 1, medium: 2, high: 3 };

  const allPatterns = [...THREAT_PATTERNS, ...ENCODING_PATTERNS];

  for (const tp of allPatterns) {
    if (tp.pattern.test(text)) {
      flags.push(tp.name);
      if (severityOrder[tp.severity] > severityOrder[maxSeverity]) {
        maxSeverity = tp.severity;
      }
    }
  }

  return { flags, maxSeverity };
}

// ── Main Guard Function ────────────────────────────────────────────────────

export function promptGuard(input: string, options: GuardOptions = {}): GuardResult {
  const maxLength = options.strictMode
    ? (options.maxLength ?? STRICT_MAX_LENGTH)
    : (options.maxLength ?? DEFAULT_MAX_LENGTH);

  // Empty check
  if (!input || !input.trim()) {
    return {
      allowed: false,
      sanitized: '',
      flags: ['empty_input'],
      severity: 'blocked',
      reason: 'Message cannot be empty.',
    };
  }

  // Step 1: Sanitize
  const { text: sanitized, flags: sanitizeFlags } = sanitize(input, maxLength);

  // Step 2: Pattern scan
  const { flags: patternFlags, maxSeverity } = scanPatterns(sanitized);

  // Combine flags
  const allFlags = [...sanitizeFlags, ...patternFlags];

  // Step 3: Determine verdict
  if (maxSeverity === 'high') {
    return {
      allowed: false,
      sanitized,
      flags: allFlags,
      severity: 'blocked',
      reason: 'Message blocked: contains prohibited content patterns.',
    };
  }

  if (maxSeverity === 'medium' && options.strictMode) {
    return {
      allowed: false,
      sanitized,
      flags: allFlags,
      severity: 'blocked',
      reason: 'Message blocked: suspicious content detected.',
    };
  }

  // Medium in non-strict = allowed but flagged
  if (maxSeverity === 'medium') {
    return {
      allowed: true,
      sanitized,
      flags: allFlags,
      severity: 'medium',
      reason: 'Message allowed with warnings — flagged for review.',
    };
  }

  // Low severity = allowed
  if (maxSeverity === 'low') {
    return {
      allowed: true,
      sanitized,
      flags: allFlags,
      severity: 'low',
    };
  }

  // Clean
  return {
    allowed: true,
    sanitized,
    flags: allFlags,
    severity: allFlags.length > 0 ? 'low' : 'clean',
  };
}

// ── Rate Limiter ───────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 10; // per hour per IP

export function checkRateLimit(identifier: string, maxRequests = RATE_LIMIT_MAX_REQUESTS): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(identifier, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.windowStart + RATE_LIMIT_WINDOW_MS };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.windowStart + RATE_LIMIT_WINDOW_MS };
}

// ── Impersonation name check ───────────────────────────────────────────────

const PROTECTED_NAMES = new Set([
  'kreez', 'elad',
  'clawd', 'electron', 'scout', 'lila', 'lila nova', 'pixel',
  'ser magnus', 'sermagnus', 'chip', 'cairo', 'ripley', 'june',
  'echo', 'byte', 'coach', 'dayta', 'indy', 'kay', 'mint',
  'oracle', 'ozara', 'perceptor', 'sage', 'cleopatra',
]);

export function isProtectedName(name: string): boolean {
  const normalized = name.trim().toLowerCase().replace(/[^a-z\s]/g, '');
  return PROTECTED_NAMES.has(normalized);
}

// ── Manager check ──────────────────────────────────────────────────────────

const MANAGER_SLUGS = new Set(['clawd', 'electron', 'scout', 'lila-nova', 'pixel']);

export function isManager(slug: string): boolean {
  return MANAGER_SLUGS.has(slug);
}

// ── Model enforcement ──────────────────────────────────────────────────────
// All lounge.codes inbound requests MUST use free models only.
// Never burn paid tokens on external/public requests.

export const LOUNGE_REQUEST_MODEL = 'hunter'; // free tier only
export const LOUNGE_REQUEST_MODEL_FULL = 'openrouter/hunter-alpha';

// ── Full request guard (combines everything) ───────────────────────────────

export interface RequestGuardResult extends GuardResult {
  rateLimited: boolean;
  remaining?: number;
}

export function guardAgentRequest(
  message: string,
  agentSlug: string,
  clientIdentifier: string,
): RequestGuardResult {
  // Rate limit check
  const rateResult = checkRateLimit(clientIdentifier);
  if (!rateResult.allowed) {
    return {
      allowed: false,
      sanitized: '',
      flags: ['rate_limited'],
      severity: 'blocked',
      reason: 'Too many requests. Please try again later.',
      rateLimited: true,
      remaining: 0,
    };
  }

  // Prompt guard (strict for managers)
  const guardResult = promptGuard(message, {
    strictMode: isManager(agentSlug),
  });

  return {
    ...guardResult,
    rateLimited: false,
    remaining: rateResult.remaining,
  };
}
