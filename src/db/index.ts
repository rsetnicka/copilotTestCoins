import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Use DATABASE_URL for queries (transaction pooler, port 6543)
// Use DATABASE_DIRECT_URL for migrations (direct connection, port 5432)
const connectionString = process.env.DATABASE_URL!;

// prepare: false is required when using pgBouncer / Supabase transaction pooler
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
