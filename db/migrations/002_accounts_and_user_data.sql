CREATE TABLE IF NOT EXISTS makon_users (
  id uuid PRIMARY KEY,
  phone text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS makon_sessions (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES makon_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS makon_sessions_expires_at_idx
  ON makon_sessions (expires_at);

CREATE TABLE IF NOT EXISTS makon_user_data (
  user_id uuid NOT NULL REFERENCES makon_users(id) ON DELETE CASCADE,
  data_key text NOT NULL,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, data_key)
);

ALTER TABLE makon_listings
  ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES makon_users(id) ON DELETE SET NULL;
