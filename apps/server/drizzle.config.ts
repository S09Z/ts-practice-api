import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		host: process.env.DB_HOST || "localhost",
		port: parseInt(process.env.DB_PORT || "5432"),
		database: process.env.DB_NAME || "postgres",
		user: process.env.DB_USER || "postgres",
		password: process.env.DB_PASSWORD?.replace(/^'(.*)'$/, '$1') || "password",
		ssl: false,
	},
});
