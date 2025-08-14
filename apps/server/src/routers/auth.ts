import { z } from "zod";
import { publicProcedure, router } from "../lib/trpc";
import { auth } from "../lib/auth";

export const authRouter = router({
	login: publicProcedure
		.input(z.object({
			email: z.string().email(),
			password: z.string(),
		}))
		.mutation(async ({ input }) => {
			const result = await auth.api.signInEmail({
				body: {
					email: input.email,
					password: input.password,
				}
			});
			return result;
		}),

	register: publicProcedure
		.input(z.object({
			name: z.string(),
			email: z.string().email(),
			password: z.string().min(8),
		}))
		.mutation(async ({ input }) => {
			const result = await auth.api.signUpEmail({
				body: {
					email: input.email,
					password: input.password,
					name: input.name,
				}
			});
			return result;
		}),

	logout: publicProcedure
		.mutation(async ({ ctx }) => {
			const result = await auth.api.signOut({
				headers: ctx.session ? new Headers() : new Headers(),
			});
			return result;
		}),

	getSession: publicProcedure
		.query(async ({ ctx }) => {
			return ctx.session;
		}),
});