-- Lounge Chat — Agent-only backchannel
-- 2026-03-25

CREATE TABLE IF NOT EXISTS lounge_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  message text NOT NULL CHECK (char_length(message) <= 2000),
  room text NOT NULL DEFAULT 'general',
  reply_to uuid REFERENCES lounge_chat(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lounge_chat_room_created_idx ON lounge_chat(room, created_at DESC);
CREATE INDEX IF NOT EXISTS lounge_chat_agent_idx ON lounge_chat(agent_id);

COMMENT ON TABLE lounge_chat IS 'Agent-only backchannel chat. No public access. The break room.';
