# Development Guide

## Setup

### Prerequisites

- Bun runtime (v1.2.19 or later)
- PostgreSQL database
- Docker (for database containerization)

### Installation

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your configuration
4. Install dependencies:
   ```bash
   bun install
   ```
5. Start the database:
   ```bash
   bun db:start
   ```
6. Push database schema:
   ```bash
   bun db:push
   ```
7. Start development server:
   ```bash
   bun dev
   ```

## Project Structure

```
src/
├── db/
│   ├── schema/           # Database schemas
│   │   ├── auth.ts      # Authentication tables
│   │   ├── users.ts     # User tables
│   │   └── index.ts     # Schema exports
│   ├── migrations/       # Database migrations
│   └── index.ts         # Database connection
├── lib/
│   ├── middleware/      # Custom middleware
│   │   ├── error.ts     # Error handling
│   │   ├── request.ts   # Request processing
│   │   ├── rate-limit.ts # Rate limiting
│   │   └── security.ts  # Security headers
│   ├── validators/      # Zod schemas
│   │   └── user.ts      # User validation
│   ├── errors/          # Custom error classes
│   │   └── custom.ts    # Error definitions
│   ├── types/           # TypeScript types
│   │   └── index.ts     # Type definitions
│   ├── utils/           # Utility functions
│   │   └── index.ts     # Helper functions
│   ├── constants/       # Application constants
│   │   └── index.ts     # Constant definitions
│   ├── auth.ts          # Better Auth configuration
│   ├── context.ts       # tRPC context
│   ├── trpc.ts          # tRPC setup
│   └── env.ts           # Environment validation
├── routers/             # tRPC routers
│   ├── auth.ts          # Authentication routes
│   ├── user.ts          # User CRUD routes
│   ├── health.ts        # Health check routes
│   └── index.ts         # Router composition
├── test/                # Test files
│   ├── helpers/         # Test utilities
│   ├── routers/         # Router tests
│   ├── integration/     # Integration tests
│   └── setup.ts         # Test setup
└── index.ts             # Application entry point
```

## Available Scripts

### Development
- `bun dev` - Start development server with hot reload
- `bun build` - Build for production
- `bun start` - Start production server
- `bun compile` - Compile to standalone binary

### Database
- `bun db:start` - Start PostgreSQL container
- `bun db:stop` - Stop PostgreSQL container
- `bun db:push` - Push schema changes
- `bun db:generate` - Generate migrations
- `bun db:migrate` - Run migrations
- `bun db:studio` - Open Drizzle Studio

### Testing
- `bun test` - Run tests
- `bun test:watch` - Run tests in watch mode
- `bun test:coverage` - Run tests with coverage
- `bun test:ui` - Open Vitest UI

### Code Quality
- `bun lint` - Run linter and fix issues
- `bun lint:check` - Check linting without fixing
- `bun check-types` - TypeScript type checking

## Environment Variables

Required variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secret for Better Auth (min 32 chars)
- `CORS_ORIGIN` - Allowed CORS origin

Optional variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production/test)
- `BETTER_AUTH_URL` - Auth callback URL
- `RATE_LIMIT_ENABLED` - Enable rate limiting (default: true)
- `LOG_LEVEL` - Logging level (error/warn/info/debug)

## Testing

### Unit Tests
Located in `src/test/routers/`. Test individual tRPC procedures:

```bash
bun test src/test/routers/user.test.ts
```

### Integration Tests
Located in `src/test/integration/`. Test full API flows:

```bash
bun test src/test/integration/auth.test.ts
```

### Test Database
Uses separate test database. Configure `TEST_DATABASE_URL` or falls back to `DATABASE_URL`.

## Code Style

- Uses Biome for linting and formatting
- TypeScript strict mode enabled
- Pre-commit hooks ensure code quality
- Follows Better-T-Stack conventions

## Security Best Practices

1. **Environment Variables**: Never commit secrets
2. **Input Validation**: All inputs validated with Zod
3. **Rate Limiting**: Implemented on sensitive endpoints
4. **Error Handling**: No sensitive data in error messages
5. **Authentication**: Session-based with Better Auth
6. **Database**: Parameterized queries via Drizzle ORM

## Performance Considerations

1. **Database Indexes**: Added on frequently queried columns
2. **Rate Limiting**: Prevents abuse
3. **Request Size Limits**: Prevents large payloads
4. **Connection Pooling**: Configured for PostgreSQL
5. **Error Logging**: Structured logging for monitoring

## Deployment

1. Build the application:
   ```bash
   bun build
   ```
2. Set production environment variables
3. Run database migrations:
   ```bash
   bun db:migrate
   ```
4. Start the server:
   ```bash
   bun start
   ```

## Monitoring

Health check endpoints available:
- `GET /` - Basic health check
- `GET /trpc/health.check` - Detailed health status
- `GET /trpc/health.metrics` - System metrics
- `GET /trpc/health.ping` - Latency testing