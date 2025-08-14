import { z } from "zod";

export const createUserSchema = z.object({
	email: z.string().email("Invalid email format"),
	fullname: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name must not exceed 100 characters"),
	age: z.number().int().min(13, "Age must be at least 13").max(120, "Age must not exceed 120"),
});

export const updateUserSchema = z.object({
	id: z.string().uuid("Invalid user ID"),
	email: z.string().email("Invalid email format").optional(),
	fullname: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name must not exceed 100 characters").optional(),
	age: z.number().int().min(13, "Age must be at least 13").max(120, "Age must not exceed 120").optional(),
});

export const getUserSchema = z.object({
	id: z.string().uuid("Invalid user ID"),
});

export const deleteUserSchema = z.object({
	id: z.string().uuid("Invalid user ID"),
});

export const getUsersSchema = z.object({
	page: z.number().int().min(1).default(1),
	per_page: z.number().int().min(1).max(100).default(10),
	search: z.string().optional(),
});

export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type GetUser = z.infer<typeof getUserSchema>;
export type DeleteUser = z.infer<typeof deleteUserSchema>;
export type GetUsers = z.infer<typeof getUsersSchema>;