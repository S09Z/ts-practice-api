# API Documentation

## Overview

This API is built using the Better-T-Stack framework with:
- **Hono** - Web server framework
- **tRPC** - Type-safe API layer
- **Drizzle ORM** - Database layer
- **Better Auth** - Authentication
- **PostgreSQL** - Database

## Base URL

```
http://localhost:3000
```

## Authentication

The API uses Better Auth for authentication with email/password support.

### Authentication Endpoints

#### Register
```
POST /api/auth/sign-up
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```
POST /api/auth/sign-in
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Logout
```
POST /api/auth/sign-out
```

## tRPC Endpoints

All tRPC endpoints are accessible via `/trpc/{router}.{procedure}`.

### Auth Router (`/trpc/auth.*`)

#### `auth.register`
- **Type**: Mutation
- **Input**: `{ name: string, email: string, password: string }`
- **Output**: User object
- **Description**: Register a new user

#### `auth.login`
- **Type**: Mutation
- **Input**: `{ email: string, password: string }`
- **Output**: Session object
- **Description**: Login user

#### `auth.logout`
- **Type**: Mutation
- **Input**: None
- **Output**: Success status
- **Description**: Logout user

#### `auth.getSession`
- **Type**: Query
- **Input**: None
- **Output**: Session object or null
- **Description**: Get current session

### User Router (`/trpc/user.*`)

#### `user.create`
- **Type**: Mutation (Protected)
- **Input**: `{ email: string, fullname: string, age: number }`
- **Output**: User object
- **Description**: Create a new user

#### `user.getById`
- **Type**: Query (Public)
- **Input**: `{ id: string }`
- **Output**: User object
- **Description**: Get user by ID

#### `user.getAll`
- **Type**: Query (Public)
- **Input**: `{ limit?: number, offset?: number, search?: string }`
- **Output**: Array of users
- **Description**: Get all users with pagination and search

#### `user.update`
- **Type**: Mutation (Protected)
- **Input**: `{ id: string, email?: string, fullname?: string, age?: number }`
- **Output**: Updated user object
- **Description**: Update user

#### `user.delete`
- **Type**: Mutation (Protected)
- **Input**: `{ id: string }`
- **Output**: `{ success: boolean, deletedUser: User }`
- **Description**: Delete user

### Health Router (`/trpc/health.*`)

#### `health.check`
- **Type**: Query (Public)
- **Input**: None
- **Output**: Health status object
- **Description**: Check system health

#### `health.metrics`
- **Type**: Query (Public)
- **Input**: None
- **Output**: System metrics
- **Description**: Get system performance metrics

#### `health.ping`
- **Type**: Query (Public)
- **Input**: `{ timestamp?: string }`
- **Output**: `{ pong: true, timestamp: string, latency?: number }`
- **Description**: Ping endpoint for latency testing

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/endpoint"
  }
}
```

### Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data
- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Access denied
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource conflict (e.g., duplicate email)
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_SERVER_ERROR` (500) - Server error

## Rate Limiting

The API implements rate limiting:

- **Auth endpoints**: 5 requests per 15 minutes
- **General API**: 100 requests per 15 minutes
- **Strict endpoints**: 10 requests per minute

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time

## Security Features

- CORS protection
- CSRF protection
- Content Security Policy headers
- Request size limits (1MB)
- Input sanitization
- SQL injection prevention via Drizzle ORM
- Environment variable validation