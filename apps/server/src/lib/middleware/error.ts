import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

export interface ErrorResponse {
	error: {
		message: string;
		code?: string;
		details?: any;
		timestamp: string;
		path: string;
	};
}

export async function errorHandler(c: Context, next: Next) {
	try {
		await next();
	} catch (error) {
		console.error("Error caught by middleware:", error);

		const timestamp = new Date().toISOString();
		const path = c.req.path;

		if (error instanceof HTTPException) {
			const response: ErrorResponse = {
				error: {
					message: error.message,
					code: error.status.toString(),
					timestamp,
					path,
				},
			};
			return c.json(response, error.status);
		}

		if (error instanceof Error) {
			// Database constraint errors
			if (error.message.includes("unique constraint")) {
				const response: ErrorResponse = {
					error: {
						message: "Resource already exists",
						code: "CONFLICT",
						timestamp,
						path,
					},
				};
				return c.json(response, 409);
			}

			// Validation errors
			if (error.message.includes("invalid input")) {
				const response: ErrorResponse = {
					error: {
						message: "Invalid input data",
						code: "BAD_REQUEST",
						timestamp,
						path,
					},
				};
				return c.json(response, 400);
			}
		}

		// Default error response
		const response: ErrorResponse = {
			error: {
				message: "Internal server error",
				code: "INTERNAL_SERVER_ERROR",
				timestamp,
				path,
			},
		};

		return c.json(response, 500);
	}
}

export function notFoundHandler(c: Context) {
	const response: ErrorResponse = {
		error: {
			message: "Route not found",
			code: "NOT_FOUND",
			timestamp: new Date().toISOString(),
			path: c.req.path,
		},
	};
	return c.json(response, 404);
}