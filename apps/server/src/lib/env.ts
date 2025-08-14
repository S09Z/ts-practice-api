import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	
	PORT: z
		.string()
		.transform((val) => parseInt(val, 10))
		.pipe(z.number().min(1).max(65535))
		.default(3000),
	
	DATABASE_URL: z
		.string()
		.url("Invalid database URL")
		.refine((url) => url.startsWith("postgresql://"), {
			message: "Database URL must be a PostgreSQL connection string",
		}),
	
	TEST_DATABASE_URL: z
		.string()
		.url("Invalid test database URL")
		.optional(),
	
	CORS_ORIGIN: z
		.string()
		.url("Invalid CORS origin URL")
		.optional(),
	
	BETTER_AUTH_SECRET: z
		.string()
		.min(32, "Auth secret must be at least 32 characters long"),
	
	BETTER_AUTH_URL: z
		.string()
		.url("Invalid auth URL")
		.optional(),
	
	// SMTP Configuration (optional)
	SMTP_HOST: z.string().optional(),
	SMTP_PORT: z
		.string()
		.transform((val) => parseInt(val, 10))
		.pipe(z.number().min(1).max(65535))
		.optional(),
	SMTP_USER: z.string().optional(),
	SMTP_PASS: z.string().optional(),
	SMTP_FROM: z.string().email("Invalid SMTP from email").optional(),
	
	// Rate limiting
	RATE_LIMIT_ENABLED: z
		.string()
		.transform((val) => val === "true")
		.pipe(z.boolean())
		.default(true),
	
	// Logging
	LOG_LEVEL: z
		.enum(["error", "warn", "info", "debug"])
		.default("info"),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function validateEnv(): Env {
	try {
		env = envSchema.parse(process.env);
		return env;
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error("❌ Environment validation failed:");
			error.issues.forEach((issue) => {
				console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
			});
			process.exit(1);
		}
		throw error;
	}
}

export function getEnv(): Env {
	if (!env) {
		env = validateEnv();
	}
	return env;
}

// Validate environment variables on module load
if (process.env.NODE_ENV !== "test") {
	validateEnv();
}