import { TRPCError } from "@trpc/server";
import { UserModel } from "../models/user.model";
import type { CreateUser, UpdateUser, GetUsers } from "../lib/validators/user";

export class UserService {
	static async createUser(userData: CreateUser) {
		const existingUser = await UserModel.findByEmail(userData.email);
		if (existingUser) {
			throw new TRPCError({
				code: "CONFLICT",
				message: "User with this email already exists",
			});
		}

		try {
			return await UserModel.create(userData);
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to create user",
				cause: error,
			});
		}
	}

	static async getUserById(id: string) {
		try {
			const user = await UserModel.findById(id);
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
	}

	static async getAllUsers(params: GetUsers) {
		try {
			const { page, per_page, search } = params;
			return await UserModel.findAll(page, per_page, search);
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch users",
				cause: error,
			});
		}
	}

	static async updateUser(updateData: UpdateUser) {
		const { id, ...userData } = updateData;

		const existingUser = await UserModel.findById(id);
		if (!existingUser) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "User not found",
			});
		}

		if (userData.email && userData.email !== existingUser.email) {
			const emailConflict = await UserModel.findByEmail(userData.email);
			if (emailConflict) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Email already in use by another user",
				});
			}
		}

		try {
			const updatedUser = await UserModel.update(id, userData);
			if (!updatedUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found after update",
				});
			}
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
	}

	static async deleteUser(id: string) {
		try {
			const deletedUser = await UserModel.delete(id);
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
	}

	static async userExists(id: string): Promise<boolean> {
		return await UserModel.exists(id);
	}
}