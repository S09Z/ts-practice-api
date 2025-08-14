import "dotenv/config";
import { beforeAll, afterAll } from "vitest";

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.BETTER_AUTH_SECRET = "test-secret-key-that-is-at-least-32-characters-long";
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.DB_HOST = "localhost";
process.env.DB_PORT = "5432";
process.env.DB_NAME = "postgres";
process.env.DB_USER = "postgres";
process.env.DB_PASSWORD = "password";

beforeAll(async () => {
	// Setup test database connection
	console.log("Test setup started");
});

afterAll(async () => {
	// Cleanup test database
	console.log("Test cleanup completed");
});