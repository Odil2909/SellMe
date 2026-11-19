CREATE TABLE IF NOT EXISTS support_conversations (
  id UUID PRIMARY KEY,
  access_token_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'bot' CHECK (status IN ('bot', 'pending_operator', 'operator', 'closed')),
  locale TEXT NOT NULL DEFAULT 'ru',
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE support_conversations DROP CONSTRAINT IF EXISTS support_conversations_status_check;
ALTER TABLE support_conversations ADD CONSTRAINT support_conversations_status_check CHECK (status IN ('bot', 'pending_operator', 'operator', 'closed'));
CREATE INDEX IF NOT EXISTS support_conversations_activity_idx ON support_conversations(last_activity_at DESC);

CREATE TABLE IF NOT EXISTS support_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant', 'operator', 'system')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS support_messages_conversation_idx ON support_messages(conversation_id, id);

CREATE TABLE IF NOT EXISTS support_telegram_state (
  id SMALLINT PRIMARY KEY CHECK (id = 1),
  update_offset BIGINT NOT NULL DEFAULT 0
);
INSERT INTO support_telegram_state(id, update_offset) VALUES(1, 0) ON CONFLICT (id) DO NOTHING;
