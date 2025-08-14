export function generateId(): string {
	return crypto.randomUUID();
}

export function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatDate(date: Date): string {
	return date.toISOString();
}

export function isValidUUID(uuid: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(uuid);
}

export function sanitizeInput(input: string): string {
	return input
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
		.replace(/javascript:/gi, "")
		.replace(/on\w+=/gi, "")
		.trim();
}

export function calculateOffset(page: number, limit: number): number {
	return (page - 1) * limit;
}

export function formatFileSize(bytes: number): string {
	const sizes = ["Bytes", "KB", "MB", "GB"];
	if (bytes === 0) return "0 Bytes";
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
}