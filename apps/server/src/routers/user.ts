import { protectedProcedure, publicProcedure, router, adminProcedure, moderatorProcedure, roleProcedure } from "../lib/trpc";
import {
	createUserSchema,
	deleteUserSchema,
	getUserSchema,
	getUsersSchema,
	updateUserSchema,
} from "../lib/validators/user";
import { UserService } from "../services/user.service";

export const userRouter = router({
	// Public: Anyone can view user details
	getById: publicProcedure
		.input(getUserSchema)
		.query(async ({ input }) => {
			return await UserService.getUserById(input.id);
		}),

	// Admin/Moderator: Can view all users with search
	getAll: moderatorProcedure
		.input(getUsersSchema)
		.query(async ({ input }) => {
			return await UserService.getAllUsers(input);
		}),

	// Admin only: Can create new users
	create: adminProcedure
		.input(createUserSchema)
		.mutation(async ({ input }) => {
			return await UserService.createUser(input);
		}),

	// Authenticated: Users can update their own profile
	// Admin/Moderator: Can update any user
	update: protectedProcedure
		.input(updateUserSchema)
		.mutation(async ({ input, ctx }) => {
			// Allow users to update their own profile, or admin/moderator to update any
			if (ctx.user.id !== input.id && !["admin", "moderator"].includes(ctx.user.role)) {
				throw new Error("You can only update your own profile");
			}
			return await UserService.updateUser(input);
		}),

	// Admin only: Can delete users
	delete: adminProcedure
		.input(deleteUserSchema)
		.mutation(async ({ input }) => {
			return await UserService.deleteUser(input.id);
		}),

	// Example: Custom role-based endpoint
	promoteUser: roleProcedure(["admin"])
		.input(getUserSchema)
		.mutation(async ({ input }) => {
			// Custom logic for promoting users
			return { message: `User ${input.id} promoted successfully` };
		}),
});