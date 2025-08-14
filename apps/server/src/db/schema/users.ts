import { boolean, integer, pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").notNull().unique(),
	fullname: text("fullname").notNull(),
	age: integer("age").notNull(),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
	emailIdx: index("users_email_idx").on(table.email),
	fullnameIdx: index("users_fullname_idx").on(table.fullname),
	ageIdx: index("users_age_idx").on(table.age),
	isActiveIdx: index("users_is_active_idx").on(table.isActive),
	createdAtIdx: index("users_created_at_idx").on(table.createdAt),
}));