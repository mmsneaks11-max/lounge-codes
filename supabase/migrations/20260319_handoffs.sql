-- Handoffs system: moving from filesystem to database
-- Replaces ~/clawd/shared/handoffs/sender-recipient/YYYY-MM-DD-topic-STATUS.md

CREATE TABLE IF NOT EXISTS handoffs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_agent TEXT NOT NULL,
  to_agent TEXT NOT NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, BLOCKED, RESOLVED
  priority TEXT DEFAULT 'p2', -- p0, p1, p2, p3
  body TEXT, -- markdown content
  blocked_on TEXT, -- who/what it's blocked on (when status=BLOCKED)
  resolution TEXT, -- what was done (when status=RESOLVED)
  machine TEXT, -- mac1, mac2, pc1 (where it originated)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_handoffs_status ON handoffs(status);
CREATE INDEX idx_handoffs_to ON handoffs(to_agent);
CREATE INDEX idx_handoffs_from ON handoffs(from_agent);
CREATE INDEX idx_handoffs_created ON handoffs(created_at DESC);

-- Agent API keys for authentication
CREATE TABLE IF NOT EXISTS agent_keys (
  agent_id TEXT PRIMARY KEY,
  api_key TEXT NOT NULL UNIQUE,
  machine TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_agent_keys_api_key ON agent_keys(api_key);
