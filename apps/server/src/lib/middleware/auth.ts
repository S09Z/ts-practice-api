import { TRPCError } from "@trpc/server";
import type { Context } from "../context";
import { auth } from "../auth";

export type UserRole = "admin" | "moderator" | "user";

export interface AuthenticatedContext extends Context {
	session: NonNullable<Context["session"]>;
	user: {
		id: string;
		email: string;
		name: string;
		role: UserRole;
		emailVerified: boolean;
	};
}

export async function requireAuth(ctx: Context): Promise<AuthenticatedContext> {
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
		});
	}

	// Get full user info including role
	const user = await auth.api.getUser({
		headers: new Headers(), // We already have session, so we can get user
		body: JSON.stringify({ userId: ctx.session.userId }),
	});

	if (!user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "User not found",
		});
	}

	return {
		...ctx,
		session: ctx.session,
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
			role: (user.role as UserRole) || "user",
			emailVerified: user.emailVerified,
		},
	};
}

export function requireRole(allowedRoles: UserRole[]) {
	return async (ctx: Context): Promise<AuthenticatedContext> => {
		const authCtx = await requireAuth(ctx);

		if (!allowedRoles.includes(authCtx.user.role)) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
			});
		}

		return authCtx;
	};
}

export function requireAdmin() {
	return requireRole(["admin"]);
}

export function requireModerator() {
	return requireRole(["admin", "moderator"]);
}

// JWT Bearer token middleware for HTTP endpoints
export async function verifyBearerToken(authHeader?: string): Promise<AuthenticatedContext> {
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Bearer token required",
		});
	}

	const token = authHeader.split(" ")[1];
	
	try {
		// Use Better Auth to verify the session token
		const session = await auth.api.getSession({
			headers: new Headers({
				Authorization: `Bearer ${token}`,
			}),
		});

		if (!session) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Invalid or expired token",
			});
		}

		// Get user info
		const user = await auth.api.getUser({
			headers: new Headers(),
			body: JSON.stringify({ userId: session.userId }),
		});

		if (!user) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "User not found",
			});
		}

		return {
			session,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: (user.role as UserRole) || "user",
				emailVerified: user.emailVerified,
			},
		};
	} catch (error) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Invalid token",
			cause: error,
		});
	}
}