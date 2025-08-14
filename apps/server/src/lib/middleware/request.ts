import type { Context, Next } from "hono";
import { z } from "zod";

export async function requestValidation(c: Context, next: Next) {
	const contentType = c.req.header("content-type");
	
	if (contentType && contentType.includes("application/json")) {
		try {
			const body = await c.req.json();
			
			// Basic sanitization
			if (typeof body === "object" && body !== null) {
				const sanitizedBody = sanitizeObject(body);
				// Store sanitized body for later use
				c.set("sanitizedBody", sanitizedBody);
			}
		} catch (error) {
			return c.json({
				error: {
					message: "Invalid JSON format",
					code: "BAD_REQUEST",
					timestamp: new Date().toISOString(),
					path: c.req.path,
				},
			}, 400);
		}
	}

	await next();
}

function sanitizeObject(obj: any): any {
	if (typeof obj !== "object" || obj === null) {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(sanitizeObject);
	}

	const sanitized: any = {};
	for (const [key, value] of Object.entries(obj)) {
		// Remove potentially dangerous properties
		if (key.startsWith("__") || key === "constructor" || key === "prototype") {
			continue;
		}

		if (typeof value === "string") {
			// Basic XSS prevention
			sanitized[key] = value
				.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
				.replace(/javascript:/gi, "")
				.replace(/on\w+=/gi, "");
		} else if (typeof value === "object") {
			sanitized[key] = sanitizeObject(value);
		} else {
			sanitized[key] = value;
		}
	}

	return sanitized;
}

export async function requestLogging(c: Context, next: Next) {
	const start = Date.now();
	const method = c.req.method;
	const path = c.req.path;
	const userAgent = c.req.header("user-agent") || "";
	const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";

	console.log(`[${new Date().toISOString()}] ${method} ${path} - ${ip} - ${userAgent}`);

	await next();

	const duration = Date.now() - start;
	const status = c.res.status;
	
	console.log(`[${new Date().toISOString()}] ${method} ${path} - ${status} - ${duration}ms`);
}