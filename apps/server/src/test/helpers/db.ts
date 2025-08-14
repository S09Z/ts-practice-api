import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "../../db/schema";

export const testDb = drizzle(process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || "");

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
			name: "Test User",
		},
		session: {
			id: "test-session-id",
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
		},
	};
}