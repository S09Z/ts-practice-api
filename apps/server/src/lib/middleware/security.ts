import type { Context, Next } from "hono";
import { secureHeaders } from "hono/secure-headers";

export async function securityHeaders(c: Context, next: Next) {
	await secureHeaders({
		contentSecurityPolicy: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "'unsafe-inline'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			imgSrc: ["'self'", "data:", "https:"],
			connectSrc: ["'self'"],
			fontSrc: ["'self'"],
			objectSrc: ["'none'"],
			mediaSrc: ["'self'"],
			frameSrc: ["'none'"],
		},
		crossOriginEmbedderPolicy: false,
	})(c, next);
}

export async function requestSizeLimit(c: Context, next: Next) {
	const contentLength = c.req.header("content-length");
	const maxSize = 1024 * 1024; // 1MB limit

	if (contentLength && parseInt(contentLength) > maxSize) {
		return c.json({
			error: {
				message: "Request payload too large",
				code: "PAYLOAD_TOO_LARGE",
				timestamp: new Date().toISOString(),
				path: c.req.path,
			},
		}, 413);
	}

	await next();
}

export async function csrfProtection(c: Context, next: Next) {
	const method = c.req.method;
	
	// Skip CSRF for safe methods
	if (["GET", "HEAD", "OPTIONS"].includes(method)) {
		await next();
		return;
	}

	const origin = c.req.header("origin");
	const referer = c.req.header("referer");
	const allowedOrigins = [
		process.env.CORS_ORIGIN || "http://localhost:3000",
		process.env.FRONTEND_URL || "http://localhost:3000",
	];

	// Check Origin header
	if (origin && !allowedOrigins.includes(origin)) {
		return c.json({
			error: {
				message: "CSRF protection: Invalid origin",
				code: "FORBIDDEN",
				timestamp: new Date().toISOString(),
				path: c.req.path,
			},
		}, 403);
	}

	// Check Referer header as fallback
	if (!origin && referer) {
		const refererUrl = new URL(referer);
		const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
		
		if (!allowedOrigins.includes(refererOrigin)) {
			return c.json({
				error: {
					message: "CSRF protection: Invalid referer",
					code: "FORBIDDEN",
					timestamp: new Date().toISOString(),
					path: c.req.path,
				},
			}, 403);
		}
	}

	await next();
}

export async function ipWhitelist(allowedIps: string[]) {
	return async (c: Context, next: Next) => {
		const clientIp = c.req.header("x-forwarded-for") || 
						c.req.header("x-real-ip") || 
						"unknown";

		if (!allowedIps.includes(clientIp)) {
			return c.json({
				error: {
					message: "Access denied: IP not allowed",
					code: "FORBIDDEN",
					timestamp: new Date().toISOString(),
					path: c.req.path,
				},
			}, 403);
		}

		await next();
	};
}