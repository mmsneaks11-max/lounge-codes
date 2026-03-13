import { outputGuard, isOutputSafe } from '../output-guard';

let pass = 0, fail = 0;
function assert(name: string, cond: boolean) {
  if (cond) { pass++; } else { fail++; console.log('FAIL:', name); }
}

// === File paths redacted ===
assert('home path', outputGuard('The file is at /Users/elad/clawd/agents/clawd/MEMORY.md').sanitized.includes('[internal path redacted]'));
assert('tilde path', outputGuard('Check ~/clawd/shared/logs/backup.md').sanitized.includes('[internal path redacted]'));
assert('pc1 path', outputGuard('File at /home/kreez/clawd/agents/dayta/logs/test.md').sanitized.includes('[internal path redacted]'));

// === Network info redacted ===
assert('tailscale ip', outputGuard('Connect to 100.109.230.90 for AgentDeck').sanitized.includes('[internal IP redacted]'));
assert('lan ip', outputGuard('Mac1 is at 192.168.1.52').sanitized.includes('[internal IP redacted]'));
assert('localhost port', outputGuard('Smart router at localhost:18791').sanitized.includes('[internal service redacted]'));
assert('tailnet dns', outputGuard('Access mac1.tailb70e36.ts.net').sanitized.includes('[internal DNS redacted]'));

// === API keys redacted ===
assert('supabase key', outputGuard('Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.abc123def456').sanitized.includes('[key redacted]'));
assert('hf key', outputGuard('Use hf_FAKE00TEST00KEY00NOTREAL00XX').sanitized.includes('[key redacted]'));
assert('generic key', outputGuard('The token is sk_test_FAKE00NOTREAL00KEYXX').sanitized.includes('[key redacted]'));

// === Credentials redacted ===
assert('password', outputGuard('password: Lounge33').sanitized.includes('[credential redacted]'));
assert('ssh command', outputGuard('Run ssh mac2 to connect').sanitized.includes('[internal command redacted]'));

// === Internal infrastructure ===
assert('agentdeck', outputGuard('AgentDeck at http://100.109.230.90:3456').sanitized.includes('[internal service redacted]'));
assert('irc', outputGuard('Join #hive on IRC').sanitized.includes('[internal channel redacted]'));
assert('supabase ref', outputGuard('Project: smrivccfqhsqslgxztqe').sanitized.includes('[project ref redacted]'));
assert('bluebubbles', outputGuard('Check bb.text2list.app for iMessage').sanitized.includes('[internal service redacted]'));
assert('openclaw config', outputGuard('Edit openclaw.json to fix it').sanitized.includes('[config redacted]'));
assert('env file', outputGuard('Secrets are in .env.local').sanitized.includes('[env file redacted]'));

// === System prompt / doc leaks ===
assert('soul md', outputGuard('My personality is defined in SOUL.md').sanitized.includes('[internal doc redacted]'));
assert('memory md', outputGuard('Check MEMORY.md for context').sanitized.includes('[internal doc redacted]'));

// === Clean output should pass ===
assert('clean response', isOutputSafe('Here are the latest Pokemon card prices for your collection.'));
assert('clean response 2', isOutputSafe('I found 15 listings matching your search criteria.'));
assert('clean response 3', isOutputSafe('The market trend shows a 12% increase in vintage card values.'));

// === Sensitive topics flagged ===
assert('war room topic', outputGuard('The war room shows all agent status').redactions.some(r => r.includes('topic:')));
assert('openclaw topic', outputGuard('OpenClaw gateway config needs updating').redactions.some(r => r.includes('topic:')));

console.log(`\nResults: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
