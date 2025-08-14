import "dotenv/config";
import { beforeAll, afterAll } from "vitest";

beforeAll(async () => {
	// Setup test database connection
	console.log("Test setup started");
});

afterAll(async () => {
	// Cleanup test database
	console.log("Test cleanup completed");
});