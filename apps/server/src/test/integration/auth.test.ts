import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { server } from "../../index";
import { cleanupTestDb, setupTestDb } from "../helpers/db";

describe("Auth Integration Tests", () => {
	beforeAll(async () => {
		await setupTestDb();
	});

	afterAll(async () => {
		await cleanupTestDb();
		// Close server after tests
		server.close();
	});

	describe("POST /api/auth/sign-up", () => {
		it("should register a new user successfully", async () => {
			const userData = {
				name: "Test User",
				email: "test@example.com",
				password: "password123",
			};

			const response = await request(server)
				.post("/api/auth/sign-up")
				.send(userData)
				.expect(200);

			expect(response.body.user).toBeDefined();
			expect(response.body.user.email).toBe(userData.email);
			expect(response.body.user.name).toBe(userData.name);
		});

		it("should reject registration with invalid email", async () => {
			const userData = {
				name: "Test User",
				email: "invalid-email",
				password: "password123",
			};

			await request(server)
				.post("/api/auth/sign-up")
				.send(userData)
				.expect(400);
		});

		it("should reject registration with short password", async () => {
			const userData = {
				name: "Test User",
				email: "test2@example.com",
				password: "123",
			};

			await request(server)
				.post("/api/auth/sign-up")
				.send(userData)
				.expect(400);
		});
	});

	describe("POST /api/auth/sign-in", () => {
		it("should login with valid credentials", async () => {
			// First register a user
			const userData = {
				name: "Login Test User",
				email: "login@example.com",
				password: "password123",
			};

			await request(server)
				.post("/api/auth/sign-up")
				.send(userData);

			// Then try to login
			const response = await request(server)
				.post("/api/auth/sign-in")
				.send({
					email: userData.email,
					password: userData.password,
				})
				.expect(200);

			expect(response.body.user).toBeDefined();
			expect(response.body.user.email).toBe(userData.email);
			expect(response.headers["set-cookie"]).toBeDefined();
		});

		it("should reject login with invalid credentials", async () => {
			await request(server)
				.post("/api/auth/sign-in")
				.send({
					email: "nonexistent@example.com",
					password: "wrongpassword",
				})
				.expect(401);
		});
	});

	describe("POST /api/auth/sign-out", () => {
		it("should logout successfully", async () => {
			const response = await request(server)
				.post("/api/auth/sign-out")
				.expect(200);

			expect(response.body.success).toBe(true);
		});
	});

	describe("tRPC Auth Routes", () => {
		it("should register via tRPC", async () => {
			const userData = {
				name: "tRPC Test User",
				email: "trpc@example.com",
				password: "password123",
			};

			const response = await request(server)
				.post("/trpc/auth.register")
				.send({
					json: userData,
				})
				.expect(200);

			expect(response.body.result.data).toBeDefined();
		});

		it("should login via tRPC", async () => {
			// First register
			const userData = {
				name: "tRPC Login User",
				email: "trpclogin@example.com",
				password: "password123",
			};

			await request(server)
				.post("/trpc/auth.register")
				.send({
					json: userData,
				});

			// Then login
			const response = await request(server)
				.post("/trpc/auth.login")
				.send({
					json: {
						email: userData.email,
						password: userData.password,
					},
				})
				.expect(200);

			expect(response.body.result.data).toBeDefined();
		});

		it("should get session via tRPC", async () => {
			const response = await request(server)
				.get("/trpc/auth.getSession")
				.expect(200);

			expect(response.body.result).toBeDefined();
		});
	});
});