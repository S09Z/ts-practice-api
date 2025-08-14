import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { userRouter } from "../../routers/user";
import { cleanupTestDb, createMockSession } from "../helpers/db";

describe("User Router", () => {
	beforeEach(async () => {
		await cleanupTestDb();
	});

	afterEach(async () => {
		await cleanupTestDb();
	});

	describe("create", () => {
		it("should create a new user successfully", async () => {
			const caller = userRouter.createCaller({
				session: createMockSession(),
			});

			const userData = {
				email: "john@example.com",
				fullname: "John Doe",
				age: 25,
			};

			const result = await caller.create(userData);

			expect(result).toMatchObject({
				email: userData.email,
				fullname: userData.fullname,
				age: userData.age,
				isActive: true,
			});
			expect(result.id).toBeDefined();
			expect(result.createdAt).toBeDefined();
		});

		it("should throw error for duplicate email", async () => {
			const caller = userRouter.createCaller({
				session: createMockSession(),
			});

			const userData = {
				email: "duplicate@example.com",
				fullname: "User One",
				age: 25,
			};

			await caller.create(userData);

			await expect(
				caller.create({
					...userData,
					fullname: "User Two",
				})
			).rejects.toThrow(TRPCError);
		});

		it("should throw error for invalid email", async () => {
			const caller = userRouter.createCaller({
				session: createMockSession(),
			});

			await expect(
				caller.create({
					email: "invalid-email",
					fullname: "John Doe",
					age: 25,
				})
			).rejects.toThrow();
		});

		it("should throw error for age below minimum", async () => {
			const caller = userRouter.createCaller({
				session: createMockSession(),
			});

			await expect(
				caller.create({
					email: "young@example.com",
					fullname: "Too Young",
					age: 12,
				})
			).rejects.toThrow();
		});
	});

	describe("getById", () => {
		it("should retrieve user by ID", async () => {
			const caller = userRouter.createCaller({
				session: null,
			});

			const userData = {
				email: "fetch@example.com",
				fullname: "Fetch User",
				age: 30,
			};

			const protectedCaller = userRouter.createCaller({
				session: createMockSession(),
			});

			const createdUser = await protectedCaller.create(userData);
			const fetchedUser = await caller.getById({ id: createdUser.id });

			expect(fetchedUser).toMatchObject(userData);
		});

		it("should throw error for non-existent user", async () => {
			const caller = userRouter.createCaller({
				session: null,
			});

			await expect(
				caller.getById({ id: "non-existent-id" })
			).rejects.toThrow(TRPCError);
		});
	});

	describe("getAll", () => {
		it("should retrieve all users with pagination", async () => {
			const caller = userRouter.createCaller({
				session: null,
			});

			const protectedCaller = userRouter.createCaller({
				session: createMockSession(),
			});

			await protectedCaller.create({
				email: "user1@example.com",
				fullname: "User One",
				age: 25,
			});

			await protectedCaller.create({
				email: "user2@example.com",
				fullname: "User Two",
				age: 30,
			});

			const result = await caller.getAll({
				page: 10,
				per_page: 0,
			});

			expect(result).toHaveLength(2);
		});

		it("should search users by name and email", async () => {
			const caller = userRouter.createCaller({
				session: null,
			});

			const protectedCaller = userRouter.createCaller({
				session: createMockSession(),
			});

			await protectedCaller.create({
				email: "searchable@example.com",
				fullname: "Searchable User",
				age: 25,
			});

			await protectedCaller.create({
				email: "other@example.com",
				fullname: "Other User",
				age: 30,
			});

			const result = await caller.getAll({
				page: 10,
				per_page: 0,
				search: "searchable",
			});

			expect(result).toHaveLength(1);
			expect(result.data[0].fullname).toBe("Searchable User");
		});
	});

	describe("update", () => {
		it("should update user successfully", async () => {
			const caller = userRouter.createCaller({
				session: createMockSession(),
			});

			const userData = {
				email: "update@example.com",
				fullname: "Original Name",
				age: 25,
			};

			const createdUser = await caller.create(userData);

			const updateData = {
				id: createdUser.id,
				fullname: "Updated Name",
				age: 26,
			};

			const updatedUser = await caller.update(updateData);

			expect(updatedUser.fullname).toBe("Updated Name");
			expect(updatedUser.age).toBe(26);
			expect(updatedUser.email).toBe(userData.email);
		});

		it("should throw error when updating to duplicate email", async () => {
			const caller = userRouter.createCaller({
				session: createMockSession(),
			});

			await caller.create({
				email: "first@example.com",
				fullname: "First User",
				age: 25,
			});

			const secondUser = await caller.create({
				email: "second@example.com",
				fullname: "Second User",
				age: 30,
			});

			await expect(
				caller.update({
					id: secondUser.id,
					email: "first@example.com",
				})
			).rejects.toThrow(TRPCError);
		});
	});

	describe("delete", () => {
		it("should delete user successfully", async () => {
			const caller = userRouter.createCaller({
				session: createMockSession(),
			});

			const userData = {
				email: "delete@example.com",
				fullname: "Delete User",
				age: 25,
			};

			const createdUser = await caller.create(userData);
			const result = await caller.delete({ id: createdUser.id });

			expect(result.success).toBe(true);
			expect(result.deletedUser.id).toBe(createdUser.id);
		});

		it("should throw error for non-existent user", async () => {
			const caller = userRouter.createCaller({
				session: createMockSession(),
			});

			await expect(
				caller.delete({ id: "non-existent-id" })
			).rejects.toThrow(TRPCError);
		});
	});
});