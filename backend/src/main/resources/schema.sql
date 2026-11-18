CREATE TABLE IF NOT EXISTS makon_users (
  id UUID PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS makon_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES makon_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS makon_sessions_expires_at_idx ON makon_sessions(expires_at);
CREATE TABLE IF NOT EXISTS makon_user_data (
  user_id UUID NOT NULL REFERENCES makon_users(id) ON DELETE CASCADE,
  data_key TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, data_key)
);
CREATE TABLE IF NOT EXISTS makon_listings (
  id UUID PRIMARY KEY,
  data JSONB NOT NULL,
  owner_user_id UUID REFERENCES makon_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS makon_listings_created_at_idx ON makon_listings(created_at DESC);
ALTER TABLE makon_listings ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES makon_users(id) ON DELETE SET NULL;
