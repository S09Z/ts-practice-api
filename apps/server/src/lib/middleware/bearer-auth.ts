import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { verifyBearerToken, type UserRole } from "./auth";

// Hono middleware for Bearer token authentication
export const bearerAuth = () => {
	return async (c: Context, next: Next) => {
		try {
			const authHeader = c.req.header("Authorization");
			const authContext = await verifyBearerToken(authHeader);
			
			// Add user info to Hono context
			c.set("user", authContext.user);
			c.set("session", authContext.session);
			
			await next();
		} catch (error: any) {
			throw new HTTPException(401, {
				message: error.message || "Unauthorized",
			});
		}
	};
};

// Hono middleware for role-based authorization
export const requireRoles = (allowedRoles: UserRole[]) => {
	return async (c: Context, next: Next) => {
		const user = c.get("user");
		
		if (!user) {
			throw new HTTPException(401, { message: "Authentication required" });
		}
		
		if (!allowedRoles.includes(user.role)) {
			throw new HTTPException(403, {
				message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
			});
		}
		
		await next();
	};
};

// Convenience middlewares
export const requireAdmin = () => requireRoles(["admin"]);
export const requireModerator = () => requireRoles(["admin", "moderator"]);