CREATE TABLE IF NOT EXISTS makon_listings (
  id uuid PRIMARY KEY,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS makon_listings_created_at_idx
  ON makon_listings (created_at DESC);
