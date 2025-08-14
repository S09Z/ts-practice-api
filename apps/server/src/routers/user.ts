import { TRPCError } from "@trpc/server";
import { eq, ilike, or } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema/users";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import {
	createUserSchema,
	deleteUserSchema,
	getUserSchema,
	getUsersSchema,
	updateUserSchema,
} from "../lib/validators/user";

export const userRouter = router({
	create: protectedProcedure
		.input(createUserSchema)
		.mutation(async ({ input }) => {
			try {
				const existingUser = await db
					.select()
					.from(users)
					.where(eq(users.email, input.email))
					.limit(1);

				if (existingUser.length > 0) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "User with this email already exists",
					});
				}

				const [newUser] = await db
					.insert(users)
					.values(input)
					.returning();

				return newUser;
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create user",
					cause: error,
				});
			}
		}),

	getById: publicProcedure
		.input(getUserSchema)
		.query(async ({ input }) => {
			try {
				const [user] = await db
					.select()
					.from(users)
					.where(eq(users.id, input.id))
					.limit(1);

				if (!user) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "User not found",
					});
				}

				return user;
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch user",
					cause: error,
				});
			}
		}),

	getAll: publicProcedure
		.input(getUsersSchema)
		.query(async ({ input }) => {
			try {
				const { limit, offset, search } = input;

				let query = db.select().from(users);

				if (search) {
					query = query.where(
						or(
							ilike(users.fullname, `%${search}%`),
							ilike(users.email, `%${search}%`)
						)
					);
				}

				const usersList = await query
					.limit(limit)
					.offset(offset)
					.orderBy(users.createdAt);

				return usersList;
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch users",
					cause: error,
				});
			}
		}),

	update: protectedProcedure
		.input(updateUserSchema)
		.mutation(async ({ input }) => {
			try {
				const { id, ...updateData } = input;

				// Check if user exists
				const [existingUser] = await db
					.select()
					.from(users)
					.where(eq(users.id, id))
					.limit(1);

				if (!existingUser) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "User not found",
					});
				}

				// If email is being updated, check for conflicts
				if (updateData.email && updateData.email !== existingUser.email) {
					const [emailConflict] = await db
						.select()
						.from(users)
						.where(eq(users.email, updateData.email))
						.limit(1);

					if (emailConflict) {
						throw new TRPCError({
							code: "CONFLICT",
							message: "Email already in use by another user",
						});
					}
				}

				const [updatedUser] = await db
					.update(users)
					.set(updateData)
					.where(eq(users.id, id))
					.returning();

				return updatedUser;
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update user",
					cause: error,
				});
			}
		}),

	delete: protectedProcedure
		.input(deleteUserSchema)
		.mutation(async ({ input }) => {
			try {
				const [deletedUser] = await db
					.delete(users)
					.where(eq(users.id, input.id))
					.returning();

				if (!deletedUser) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "User not found",
					});
				}

				return { success: true, deletedUser };
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to delete user",
					cause: error,
				});
			}
		}),
});