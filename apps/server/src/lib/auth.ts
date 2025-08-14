import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema/auth";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",

		schema: schema,
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: {
		enabled: true,
	},
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL,
});

// export const auth = betterAuth({
// 	adapter: DrizzleAdapter(db),
// 	sessionMode: "jwt",
// 	providers: [
// 	  // Email provider
// 	  email({
// 		server: {
// 		  host: process.env.SMTP_HOST!,
// 		  port: parseInt(process.env.SMTP_PORT!),
// 		  auth: {
// 			user: process.env.SMTP_USER!,
// 			pass: process.env.SMTP_PASS!,
// 		  },
// 		},
// 		from: process.env.SMTP_FROM!,
// 	  }),
// 	],
//   });



