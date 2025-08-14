import { initTRPC } from "@trpc/server";
import type { Context } from "./context";
import { requireAuth, requireRole, requireAdmin, requireModerator } from "./middleware/auth";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
	const authCtx = await requireAuth(ctx);
	return next({
		ctx: authCtx,
	});
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
	const authCtx = await requireAdmin()(ctx);
	return next({
		ctx: authCtx,
	});
});

export const moderatorProcedure = t.procedure.use(async ({ ctx, next }) => {
	const authCtx = await requireModerator()(ctx);
	return next({
		ctx: authCtx,
	});
});

export const roleProcedure = (roles: Parameters<typeof requireRole>[0]) => 
	t.procedure.use(async ({ ctx, next }) => {
		const authCtx = await requireRole(roles)(ctx);
		return next({
			ctx: authCtx,
		});
	});
