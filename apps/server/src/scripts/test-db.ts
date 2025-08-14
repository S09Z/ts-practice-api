import { Pool } from "pg";
import { sql } from "drizzle-orm";

async function testDatabaseConnection() {
  // Debug connection parameters
  console.log("🔍 Debug connection parameters:");
  console.log("DB_HOST:", process.env.DB_HOST || "localhost");
  console.log("DB_PORT:", process.env.DB_PORT || "5432");
  console.log("DB_NAME:", process.env.DB_NAME || "postgres");
  console.log("DB_USER:", process.env.DB_USER || "postgres");
  console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? `"[HIDDEN PASS]"` : "using default");
  
  const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "postgres",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD?.replace(/^'(.*)'$/, '$1') || "password",
  });

  try {
    console.log("\n🔌 Testing database connection...");
    
    // Test basic connection
    const client = await pool.connect();
    console.log("✅ Database connection successful!");
    
    // Test simple query
    const result = await client.query('SELECT 1 as test');
    console.log("📋 Test query result:", result.rows[0]);
    
    // Test database version
    const version = await client.query('SELECT version()');
    console.log("📝 PostgreSQL version:", version.rows[0].version.split(' ')[0]);
    
    client.release();
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Database connection failed:");
    console.error(error.message);
    await pool.end();
    process.exit(1);
  }
}

testDatabaseConnection();