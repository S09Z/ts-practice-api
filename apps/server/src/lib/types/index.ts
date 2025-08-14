export interface HealthStatus {
	status: "healthy" | "unhealthy";
	timestamp: string;
	uptime: number;
	version: string;
	checks: {
		database: "healthy" | "unhealthy";
		memory: "healthy" | "unhealthy";
		environment: "healthy" | "unhealthy";
	};
}

export interface ApiResponse<T = any> {
	data?: T;
	error?: {
		message: string;
		code: string;
		timestamp: string;
		path?: string;
	};
	meta?: {
		page?: number;
		limit?: number;
		total?: number;
	};
}

export interface PaginationParams {
	page?: number;
	limit?: number;
	offset?: number;
}

export interface SearchParams {
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export type QueryParams = PaginationParams & SearchParams;