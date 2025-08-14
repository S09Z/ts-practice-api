export class AppError extends Error {
	public readonly statusCode: number;
	public readonly code: string;
	public readonly isOperational: boolean;

	constructor(message: string, statusCode: number, code: string, isOperational = true) {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
		this.isOperational = isOperational;

		Error.captureStackTrace(this, this.constructor);
	}
}

export class ValidationError extends AppError {
	constructor(message: string, details?: any) {
		super(message, 400, "VALIDATION_ERROR");
		this.name = "ValidationError";
	}
}

export class NotFoundError extends AppError {
	constructor(resource: string) {
		super(`${resource} not found`, 404, "NOT_FOUND");
		this.name = "NotFoundError";
	}
}

export class ConflictError extends AppError {
	constructor(message: string) {
		super(message, 409, "CONFLICT");
		this.name = "ConflictError";
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Unauthorized access") {
		super(message, 401, "UNAUTHORIZED");
		this.name = "UnauthorizedError";
	}
}

export class ForbiddenError extends AppError {
	constructor(message = "Forbidden access") {
		super(message, 403, "FORBIDDEN");
		this.name = "ForbiddenError";
	}
}

export class DatabaseError extends AppError {
	constructor(message: string, originalError?: Error) {
		super(message, 500, "DATABASE_ERROR");
		this.name = "DatabaseError";
		if (originalError) {
			this.stack = originalError.stack;
		}
	}
}

export class RateLimitError extends AppError {
	constructor(message = "Too many requests") {
		super(message, 429, "RATE_LIMIT_EXCEEDED");
		this.name = "RateLimitError";
	}
}

export class InternalServerError extends AppError {
	constructor(message = "Internal server error") {
		super(message, 500, "INTERNAL_SERVER_ERROR", false);
		this.name = "InternalServerError";
	}
}

export function isAppError(error: any): error is AppError {
	return error instanceof AppError;
}