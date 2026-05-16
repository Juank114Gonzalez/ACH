# ACH Finance — Personal Finance Management Platform

A production-ready personal finance platform built with Next.js 15, Express, PostgreSQL, and Docker.

## Tech Stack


| Layer          | Technology                                                                        |
| -------------- | --------------------------------------------------------------------------------- |
| Frontend       | Next.js 15, TypeScript, TailwindCSS, shadcn/ui, React Query, React Hook Form, Zod |
| Backend        | Node.js, Express, TypeScript, Prisma ORM                                          |
| Database       | PostgreSQL 16                                                                     |
| Auth           | JWT (access + refresh tokens), bcrypt, HTTP-only cookies                          |
| Testing        | Vitest, Supertest, Playwright                                                     |
| Code Quality   | ESLint, Prettier, Husky, lint-staged                                              |
| Infrastructure | Docker Compose, GitHub Actions CI/CD                                              |


## Project Structure

```
ACH/
├── backend/               # Express API
│   ├── src/
│   │   ├── config/        # env, database, logger
│   │   ├── controllers/   # request/response handlers
│   │   ├── middlewares/   # auth, error, rate-limit, validate
│   │   ├── repositories/  # database access layer
│   │   ├── routes/        # Express routers
│   │   ├── services/      # business logic
│   │   ├── types/         # TypeScript types/DTOs
│   │   ├── utils/         # JWT, password, pagination, AppError
│   │   ├── app.ts         # Express app factory
│   │   └── server.ts      # Bootstrap + graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma  # Normalized schema
│   │   └── seed.ts        # Default categories + demo user
│   └── tests/
│       ├── unit/          # Service-level unit tests
│       └── integration/   # HTTP integration tests
│
├── frontend/              # Next.js 15 App Router
│   ├── src/
│   │   ├── app/           # Next.js pages (route groups)
│   │   │   ├── (auth)/    # login, register
│   │   │   └── (dashboard)/ # dashboard, transactions, categories, budgets
│   │   ├── components/    # Shared UI + Providers
│   │   ├── features/      # Feature-based modules
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── categories/
│   │   │   ├── budgets/
│   │   │   └── layout/    # Sidebar, Header
│   │   ├── hooks/         # React Query + domain hooks
│   │   ├── lib/           # api.ts, queryClient, utils
│   │   ├── store/         # Zustand auth store
│   │   └── types/         # Shared TypeScript types
│   └── tests/
│       ├── unit/          # Vitest component/util tests
│       └── e2e/           # Playwright tests
│
├── .github/workflows/     # CI/CD pipelines
├── scripts/               # Startup helpers
├── docker-compose.yml     # Production compose
├── docker-compose.dev.yml # Dev database only
└── .env.example           # Environment template
```

## Quick Start (Docker – Recommended)

```bash
# 1. Clone and enter the project
cd ACH

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your secrets (JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, POSTGRES_PASSWORD)

# 3. Start all services
docker compose up --build -d

# 4. Run database migrations
docker compose exec backend npx prisma migrate deploy

# 5. Seed default categories
docker compose exec backend npm run db:seed
```

Open [http://localhost:3000](http://localhost:3000)

## Local Development

### Prerequisites

- Node.js 22+
- Docker Desktop

### 1. Start the database only

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 2. Setup backend

```bash
cd backend
cp .env.example .env          # edit DATABASE_URL, JWT secrets
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Backend runs on [http://localhost:4000](http://localhost:4000)

### 3. Setup frontend

```bash
cd frontend
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
npm install
npm run dev
```

Frontend runs on [http://localhost:3000](http://localhost:3000)

## API Reference

Base URL: `http://localhost:4000/api/v1`

### Authentication


| Method | Path               | Auth   | Description           |
| ------ | ------------------ | ------ | --------------------- |
| POST   | `/auth/register`   | —      | Create account        |
| POST   | `/auth/login`      | —      | Login, returns tokens |
| POST   | `/auth/refresh`    | Cookie | Rotate refresh token  |
| POST   | `/auth/logout`     | —      | Revoke refresh token  |
| POST   | `/auth/logout-all` | Bearer | Revoke all sessions   |
| GET    | `/auth/me`         | Bearer | Current user info     |


### Transactions


| Method | Path                                                    | Description                  |
| ------ | ------------------------------------------------------- | ---------------------------- |
| GET    | `/transactions?page=1&limit=15&type=EXPENSE&search=...` | List with pagination/filters |
| GET    | `/transactions/summary?startDate=&endDate=`             | Balance summary              |
| GET    | `/transactions/:id`                                     | Get by ID                    |
| POST   | `/transactions`                                         | Create                       |
| PATCH  | `/transactions/:id`                                     | Update                       |
| DELETE | `/transactions/:id`                                     | Soft delete                  |


**Create/Update payload:**

```json
{
  "type": "EXPENSE",
  "amount": 45.50,
  "description": "Coffee",
  "categoryId": "clxxx...",
  "date": "2026-05-16",
  "notes": "Optional"
}
```

### Categories


| Method | Path                       | Description                    |
| ------ | -------------------------- | ------------------------------ |
| GET    | `/categories?type=EXPENSE` | List (filterable by type)      |
| GET    | `/categories/:id`          | Get by ID                      |
| POST   | `/categories`              | Create                         |
| PATCH  | `/categories/:id`          | Update                         |
| DELETE | `/categories/:id`          | Soft delete (non-default only) |


### Budgets


| Method | Path                                | Description                 |
| ------ | ----------------------------------- | --------------------------- |
| GET    | `/budgets?month=5&year=2026`        | List budgets                |
| GET    | `/budgets/alerts?month=5&year=2026` | Get warning/exceeded alerts |
| GET    | `/budgets/:id`                      | Get by ID                   |
| POST   | `/budgets`                          | Create                      |
| PATCH  | `/budgets/:id`                      | Update amount               |
| DELETE | `/budgets/:id`                      | Delete                      |


### Response Format

```json
{
  "success": true,
  "data": { ... }
}
```

Paginated responses:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 15,
    "totalPages": 7,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email address"]
  }
}
```

## Security

- **JWT Access Tokens**: short-lived (15 min), sent via Authorization header
- **Refresh Tokens**: long-lived (7d), stored in HTTP-only secure cookies + DB
- **Refresh Token Rotation**: each refresh issues a new token and revokes the old one
- **Rate Limiting**: 100 req/15min globally; 10 req/15min on auth endpoints (failed only)
- **Helmet**: security headers (CSP, HSTS, XSS protection)
- **CORS**: explicit allowlist
- **User Isolation**: all queries filter by `userId` from JWT payload
- **Input Validation**: Zod schemas on every endpoint
- **Soft Deletes**: data is never permanently deleted; `deletedAt` timestamp is set

## Testing

```bash
# Backend – unit + integration
cd backend && npm test

# Backend – with coverage
cd backend && npm run test:coverage

# Frontend – unit tests
cd frontend && npm test

# Frontend – E2E (requires running app)
cd frontend && npm run test:e2e
```

## CI/CD

GitHub Actions runs on every push to `main` and `develop`:

1. **Lint** — ESLint + Prettier check (backend & frontend, parallel)
2. **Test** — Vitest with coverage (backend & frontend, parallel)
3. **Build** — TypeScript compilation + Next.js build (after tests pass)
4. **Docker** — validates both images build cleanly (after builds pass)
5. **E2E** — Playwright against a full stack (main branch only)

## Architecture Decisions

### Backend

- **Repository pattern** decouples database queries from business logic, enabling easy testing via mocks
- **AppError class** provides typed, consistent error handling across all layers
- **Centralized error middleware** catches all errors in a single place, including Zod, Prisma, and AppError
- **Soft deletes** on users, categories, and transactions preserve audit trail
- **Budget `spent` field** is recalculated synchronously on every transaction create/update/delete to keep data consistent without needing aggregation queries on reads

### Frontend

- **App Router route groups** `(auth)` and `(dashboard)` allow different layouts without affecting URL structure
- `**ProtectedRoute` component** handles client-side auth guard with redirect
- **Axios interceptor** transparently refreshes the access token and retries the original request
- **React Query** manages all server state — no Redux/Zustand for remote data
- **Zustand** is used only for client auth state (user + isAuthenticated)
- **Feature-based structure** keeps related components, hooks, and logic co-located

## AI Usage

This section documents how AI tools were used in the development of this project:

- **Wireframe generation**: Google Stitch (via MCP) was used to generate an initial fintech dashboard wireframe to guide the UI design direction
- **Scaffolding**: AI assistance was used to generate boilerplate code structures following the defined architecture
- **Code review**: AI was used to validate security patterns (JWT rotation, rate limiting configuration)

All generated code was reviewed, adapted, and validated.

## License

MIT