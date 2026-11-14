import { neon } from '@neondatabase/serverless';

let databasePromise;

export async function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw Object.assign(new Error('DATABASE_URL не настроен в Vercel.'), { status: 503 });
  }
  if (!databasePromise) {
    const sql = neon(process.env.DATABASE_URL);
    databasePromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS makon_listings (
          id uuid PRIMARY KEY,
          data jsonb NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS makon_listings_created_at_idx
          ON makon_listings (created_at DESC)
      `;
      return sql;
    })().catch(error => {
      databasePromise = undefined;
      throw error;
    });
  }
  return databasePromise;
}
