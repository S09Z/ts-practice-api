import { publicProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { z } from "zod";
import type { HealthStatus } from "../lib/types";

async function checkDatabase(): Promise<"healthy" | "unhealthy"> {
	try {
		await db.execute("SELECT 1");
		return "healthy";
	} catch {
		return "unhealthy";
	}
}

function checkMemory(): "healthy" | "unhealthy" {
	const memUsage = process.memoryUsage();
	const memLimitMB = 512; // 512MB limit
	const currentUsageMB = memUsage.heapUsed / 1024 / 1024;
	
	return currentUsageMB < memLimitMB ? "healthy" : "unhealthy";
}

function checkEnvironment(): "healthy" | "unhealthy" {
	const requiredEnvVars = ["DATABASE_URL", "BETTER_AUTH_SECRET"];
	
	for (const envVar of requiredEnvVars) {
		if (!process.env[envVar]) {
			return "unhealthy";
		}
	}
	
	return "healthy";
}

export const healthRouter = router({
	check: publicProcedure
		.query(async (): Promise<HealthStatus> => {
			const checks = {
				database: await checkDatabase(),
				memory: checkMemory(),
				environment: checkEnvironment(),
			};

			const status = Object.values(checks).every(check => check === "healthy") 
				? "healthy" 
				: "unhealthy";

			return {
				status,
				timestamp: new Date().toISOString(),
				uptime: process.uptime(),
				version: process.env.npm_package_version || "unknown",
				checks,
			};
		}),

	metrics: publicProcedure
		.query(() => {
			const memUsage = process.memoryUsage();
			const cpuUsage = process.cpuUsage();

			return {
				timestamp: new Date().toISOString(),
				uptime: process.uptime(),
				memory: {
					heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
					heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
					external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100, // MB
					rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100, // MB
				},
				cpu: {
					user: Math.round(cpuUsage.user / 1000), // microseconds to milliseconds
					system: Math.round(cpuUsage.system / 1000), // microseconds to milliseconds
				},
				process: {
					pid: process.pid,
					version: process.version,
					platform: process.platform,
					arch: process.arch,
				},
			};
		}),

	ping: publicProcedure
		.input(z.object({
			timestamp: z.string().optional(),
		}))
		.query(({ input }) => {
			const now = new Date().toISOString();
			const latency = input.timestamp 
				? Date.now() - new Date(input.timestamp).getTime()
				: 0;

			return {
				pong: true,
				timestamp: now,
				latency: latency > 0 ? latency : undefined,
			};
		}),
});