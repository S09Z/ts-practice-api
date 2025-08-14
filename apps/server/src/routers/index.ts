import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { healthRouter } from "./health";

export const appRouter = router({
	auth: authRouter,
	user: userRouter,
	health: healthRouter,
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
});
export type AppRouter = typeof appRouter;
