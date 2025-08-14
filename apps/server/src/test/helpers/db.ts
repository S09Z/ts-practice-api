import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "../../db/schema";

// Use same connection approach as main app
const testPool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "postgres",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD?.replace(/^'(.*)'$/, '$1') || "password",
  ssl: false,
});

export const testDb = drizzle(testPool);

export async function setupTestDb() {
	// Run migrations for test database
	await migrate(testDb, { migrationsFolder: "./src/db/migrations" });
}

export async function cleanupTestDb() {
	// Clean up test data
	await testDb.delete(schema.users);
}

export function createMockSession() {
	return {
		user: {
			id: "test-user-id",
			email: "test@example.com",
			emailVerified: true,
			name: "Test User",
			createdAt: new Date(),
			updatedAt: new Date(),
			role: "admin",
		},
		session: {
			id: "test-session-id",
			userId: "test-user-id",
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
			createdAt: new Date(),
			updatedAt: new Date(),
			token: "test-token",
			ipAddress: null,
			userAgent: null,
		},
	};
}