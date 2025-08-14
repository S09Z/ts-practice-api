import { eq, ilike, or, count } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema/users";
import type { CreateUser, UpdateUser } from "../lib/validators/user";

export class UserModel {
	static async create(userData: CreateUser) {
		const [newUser] = await db
			.insert(users)
			.values(userData)
			.returning();
		return newUser;
	}

	static async findById(id: string) {
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1);
		return user || null;
	}

	static async findByEmail(email: string) {
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);
		return user || null;
	}

	static async findAll(page: number, perPage: number, search?: string) {
		const offset = (page - 1) * perPage;
		
		const searchCondition = search ? or(
			ilike(users.fullname, `%${search}%`),
			ilike(users.email, `%${search}%`)
		) : undefined;

		// Build the main query
		let dataQuery = db.select().from(users);
		if (searchCondition) {
			dataQuery = dataQuery.where(searchCondition);
		}

		// Build the count query  
		let countQuery = db.select({ count: count() }).from(users);
		if (searchCondition) {
			countQuery = countQuery.where(searchCondition);
		}

		const [data, totalResult] = await Promise.all([
			dataQuery
				.limit(perPage)
				.offset(offset)
				.orderBy(users.createdAt),
			countQuery
		]);

		const total = Number(totalResult[0]?.count) || 0;

		return {
			data,
			pagination: {
				page,
				per_page: perPage,
				total,
				total_pages: Math.ceil(total / perPage),
				has_next: page < Math.ceil(total / perPage),
				has_prev: page > 1,
			}
		};
	}

	static async update(id: string, updateData: Partial<Omit<UpdateUser, "id">>) {
		const [updatedUser] = await db
			.update(users)
			.set(updateData)
			.where(eq(users.id, id))
			.returning();
		return updatedUser || null;
	}

	static async delete(id: string) {
		const [deletedUser] = await db
			.delete(users)
			.where(eq(users.id, id))
			.returning();
		return deletedUser || null;
	}

	static async exists(id: string): Promise<boolean> {
		const user = await this.findById(id);
		return user !== null;
	}

	static async emailExists(email: string): Promise<boolean> {
		const user = await this.findByEmail(email);
		return user !== null;
	}
}