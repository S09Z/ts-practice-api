import type { Context, Next } from "hono";
import { RateLimitError } from "../errors/custom";

interface RateLimitConfig {
	windowMs: number;
	maxRequests: number;
	keyGenerator?: (c: Context) => string;
	skipSuccessfulRequests?: boolean;
	skipFailedRequests?: boolean;
}

class InMemoryStore {
	private store = new Map<string, { count: number; resetTime: number }>();

	get(key: string): { count: number; resetTime: number } | undefined {
		const now = Date.now();
		const record = this.store.get(key);
		
		if (!record || now >= record.resetTime) {
			return undefined;
		}
		
		return record;
	}

	set(key: string, value: { count: number; resetTime: number }): void {
		this.store.set(key, value);
	}

	cleanup(): void {
		const now = Date.now();
		for (const [key, value] of this.store.entries()) {
			if (now >= value.resetTime) {
				this.store.delete(key);
			}
		}
	}
}

const store = new InMemoryStore();

// Cleanup expired entries every 5 minutes
setInterval(() => store.cleanup(), 5 * 60 * 1000);

export function createRateLimit(config: RateLimitConfig) {
	const {
		windowMs,
		maxRequests,
		keyGenerator = (c: Context) => 
			c.req.header("x-forwarded-for") || 
			c.req.header("x-real-ip") || 
			"unknown",
		skipSuccessfulRequests = false,
		skipFailedRequests = false,
	} = config;

	return async (c: Context, next: Next) => {
		const key = keyGenerator(c);
		const now = Date.now();
		const resetTime = now + windowMs;

		let record = store.get(key);

		if (!record) {
			record = { count: 1, resetTime };
			store.set(key, record);
		} else {
			record.count++;
			store.set(key, record);
		}

		if (record.count > maxRequests) {
			throw new RateLimitError(`Too many requests. Limit: ${maxRequests} requests per ${windowMs / 1000} seconds`);
		}

		c.header("X-RateLimit-Limit", maxRequests.toString());
		c.header("X-RateLimit-Remaining", Math.max(0, maxRequests - record.count).toString());
		c.header("X-RateLimit-Reset", new Date(record.resetTime).toISOString());

		try {
			await next();
			
			// Optionally skip counting successful requests
			if (skipSuccessfulRequests && c.res.status < 400) {
				record.count--;
				store.set(key, record);
			}
		} catch (error) {
			// Optionally skip counting failed requests
			if (skipFailedRequests && c.res.status >= 400) {
				record.count--;
				store.set(key, record);
			}
			throw error;
		}
	};
}

export const authRateLimit = createRateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	maxRequests: 5, // 5 auth attempts per 15 minutes
});

export const apiRateLimit = createRateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	maxRequests: 100, // 100 requests per 15 minutes
});

export const strictRateLimit = createRateLimit({
	windowMs: 60 * 1000, // 1 minute
	maxRequests: 10, // 10 requests per minute
});