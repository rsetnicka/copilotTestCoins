import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Use DATABASE_URL for queries (transaction pooler, port 6543)
// Use DATABASE_DIRECT_URL for migrations (direct connection, port 5432)
const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is missing or empty. Copy .env.example to .env.local and set DATABASE_URL to your Supabase transaction pooler URI (port 6543, include ?pgbouncer=true)."
  );
}

let client: ReturnType<typeof postgres>;
try {
  // prepare: false is required when using pgBouncer / Supabase transaction pooler
  client = postgres(connectionString, { prepare: false });
} catch (e) {
  const detail = e instanceof Error ? e.message : String(e);
  throw new Error(
    `Could not open database connection (${detail}). Check DATABASE_URL in .env.local — it must be a full postgresql:// URI; URL-encode special characters in the password.`,
    { cause: e }
  );
}

export const db = drizzle(client, { schema });
