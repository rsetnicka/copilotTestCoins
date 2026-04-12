import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Prefer direct Postgres (5432) for introspection/push — the Supabase transaction
// pooler (6543) often hangs or misbehaves with drizzle-kit pull/push.
const dbUrl =
  process.env.DATABASE_DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
if (!dbUrl) {
  throw new Error(
    "Set DATABASE_URL or DATABASE_DIRECT_URL in .env.local for Drizzle CLI."
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
