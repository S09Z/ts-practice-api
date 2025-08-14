import "dotenv/config";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { auth } from "./lib/auth";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";
import { errorHandler, notFoundHandler } from "./lib/middleware/error";
import { requestLogging, requestValidation } from "./lib/middleware/request";

// Extend Hono context to include user and session
declare module "hono" {
	interface ContextVariableMap {
		user: any;
		session: any;
	}
}

const app = new Hono();

app.use(requestLogging);
app.use(errorHandler);
app.use(requestValidation);
app.use(logger());
app.use(
	"/*",
	cors({
		origin: process.env.CORS_ORIGIN || "",
		allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

// Better Auth routes - handle all auth endpoints
app.all("/api/auth/*", async (c) => {
	const response = await auth.handler(c.req.raw);
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers,
	});
});

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

app.get("/", (c) => {
	return c.text("OK");
});

// Example protected HTTP routes using Bearer token auth
import { bearerAuth, requireAdmin, requireModerator } from "./lib/middleware/bearer-auth";

app.get("/api/profile", bearerAuth(), (c) => {
	const user = c.get("user") as any;
	return c.json({ message: "Profile data", user });
});

app.get("/api/admin/dashboard", bearerAuth(), requireAdmin(), (c) => {
	return c.json({ message: "Admin dashboard data" });
});

app.get("/api/moderator/reports", bearerAuth(), requireModerator(), (c) => {
	return c.json({ message: "Moderator reports" });
});

app.notFound(notFoundHandler);

// Create HTTP server for testing
const server = serve({
	fetch: app.fetch,
	port: 0, // Use random port for testing
});

export default app;
export { server };
