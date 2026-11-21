import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let pool: Pool | undefined;
export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("Brakuje DATABASE_URL.");
  return (pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 8,
  }));
}

export const getDatabase = () => drizzle(getPool());
