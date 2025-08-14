import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Option 1: Use URL (requires URL-encoded password)
// export const db = drizzle(process.env.DATABASE_URL || "");

// Option 2: Use connection object (handles special characters)
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "postgres",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD?.replace(/^'(.*)'$/, '$1') || "password",
  ssl: false,
});

export const db = drizzle(pool);
