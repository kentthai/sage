# Sage

AI-powered lifelong learning agent and knowledge journal. Helps users capture, organize, and grow knowledge through conversational AI.

## Quick Commands

```bash
# Install dependencies
npm install

# Build shared package (required before running API)
npm run build -w @sage/shared

# Start infrastructure (Postgres, Redis, Neo4j)
docker compose -f docker/docker-compose.yml up -d

# Run API (with hot reload) - port 3000
npm run dev:api

# Run frontend (with HMR) - port 5173
npm run dev:web

# Run both API and frontend concurrently
npm run dev

# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Type check all packages
npm run typecheck

# Build all packages
npm run build
```

## Project Structure

```
sage/
├── packages/
│   ├── api/                  # Backend service (Node.js + Express)
│   │   ├── src/
│   │   │   ├── controllers/  # Route handlers
│   │   │   ├── services/     # Business logic
│   │   │   ├── repositories/ # Data access
│   │   │   ├── interfaces/   # Provider interfaces (swappable)
│   │   │   ├── infrastructure/ # Interface implementations
│   │   │   ├── db/           # Drizzle ORM schema and connection
│   │   │   └── container.ts  # Dependency injection
│   │   ├── drizzle/          # SQL migrations
│   │   └── tests/
│   ├── web/                  # React frontend
│   │   ├── src/
│   │   └── tests/
│   └── shared/               # Shared types and utilities
├── docker/                   # Docker configs (infrastructure only)
└── e2e/                      # End-to-end tests
```

## Key Conventions

- **Interface-first design**: All external dependencies use interfaces for swappability
- **Interfaces location**: `packages/api/src/interfaces/`
- **TypeScript strict mode** enabled
- **Tests**: Located in `tests/` folder within each package
- **Build order**: `@sage/shared` must be built before other packages can import from it

## Git Workflow

- **Never commit directly to main** - always create a feature branch
- **Branch naming**:
  - `feature/description` for new features
  - `fix/description` for bug fixes

## Technology Choices

- **Dependency Injection**: InversifyJS - configured in `packages/api/src/container.ts`
- **Job Queue**: BullMQ + Redis (swappable to SQS via `IJobQueue` interface)
- **Database ORM**: Drizzle ORM - schema in `packages/api/src/db/schema/`
- **Frontend State**: Zustand (UI state) + TanStack Query (server state)
- **Styling**: Tailwind CSS + shadcn/ui components

## Frontend Components

Using [shadcn/ui](https://ui.shadcn.com) - copy-paste components built on Radix UI.

```bash
# Add new components
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
```

- Components location: `packages/web/src/components/ui/`
- Import alias: `@/components/ui/button`

## Database Setup

```bash
# Start Postgres (requires Docker)
docker compose -f docker/docker-compose.yml up -d postgres

# Initialize schema (first time only)
cd packages/api && npm run db:init

# Or use Drizzle Kit (requires Node 20+)
npm run db:push -w @sage/api
```

### Schema Location
- Drizzle schema: `packages/api/src/db/schema/`
- Raw SQL migration: `packages/api/drizzle/0000_initial_schema.sql`

### Tables
- `users` - User accounts and preferences
- `knowledge_entries` - Core knowledge items with spaced repetition metadata
- `concepts` - Concept metadata (relationships in Neo4j)
- `conversations` / `messages` - Chat history
- `review_sessions` / `review_items` - Spaced repetition sessions
- `notifications` - User notifications

## Architecture

- **Docker = infrastructure only** (Postgres, Redis, Neo4j)
- **App code runs natively** with hot reload for fast iteration
- See `TECHNICAL_SPEC.md` for full architectural details

## Infrastructure

### PostgreSQL
- **Host**: `localhost:5432`
- **Dev database**: `sage`
- **Test database**: `sage_test`
- **Credentials**: `sage` / `sage_dev`

### Redis
- **Host**: `localhost:6379`
- Used for job queue (BullMQ) and caching

### Neo4j
- **HTTP**: `localhost:7474` (browser UI)
- **Bolt**: `localhost:7687` (driver connection)
- **Credentials**: `neo4j` / `sage_dev`
