import { db } from "../../db";
import * as schema from "../../db/schema";

export async function setupTestDb() {
	// Test setup if needed - database should already be migrated
	console.log("Test database ready");
}

export async function cleanupTestDb() {
	// Clean up test data using the same db connection as the app
	await db.delete(schema.users);
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