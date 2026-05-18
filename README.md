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

## Modules

### Module 1 — Authentication & Session Management
- Register and login with email and password
- Secure sessions with JWT access tokens (15 min) and refresh tokens (7 days, HTTP-only cookie)
- Refresh token rotation — each refresh issues a new token and revokes the old one
- "Keep me signed in" option for persistent sessions across browser restarts
- Full user isolation — every query is scoped to the authenticated user

### Module 2 — Financial Movements
- Record income and expense transactions with type, amount, description, category, and date
- Edit and delete (soft delete) movements
- Paginated and sortable transaction list (10 per page)
- Filter by type, category, date range, and free-text search
- Real-time balance summary (total income − total expenses)

### Module 3 — Categories & Budgets
- Create and manage custom income/expense categories with colors
- Assign a monthly maximum budget to each expense category
- API-level alerts when spending exceeds 80% (warning) and 100% (exceeded) of a budget
- Budget status per category: total budget, amount spent, and usage percentage
- Analytics dashboard with cash flow, net worth evolution, and spending breakdown

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
│   │   │   └── (dashboard)/ # dashboard, transactions, categories, budgets, analytics
│   │   ├── components/    # Shared UI + Providers
│   │   ├── features/      # Feature-based modules
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── categories/
│   │   │   ├── budgets/
│   │   │   ├── analytics/
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

## Quick Start (Docker — Recommended)

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

# 5. Seed default categories and demo user
docker compose exec backend npx prisma db seed
```

Open [http://localhost:3000](http://localhost:3000)

> **Demo credentials** — `demo@achfinance.com` / `Demo1234!`

## Local Development

### Prerequisites

- Node.js 22+
- Docker Desktop

### 1. Start the database

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 2. Install all dependencies (run from project root)

```bash
# Always run from the root first — this installs Husky and workspace deps together
npm install
```

### 3. Setup and start the backend

```bash
cd backend
cp .env.example .env          # edit DATABASE_URL and JWT secrets
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Backend runs on [http://localhost:4000](http://localhost:4000)

### 4. Setup and start the frontend

```bash
cd frontend
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
npm run dev
```

Frontend runs on [http://localhost:3000](http://localhost:3000)

## API Reference

Base URL: `http://localhost:4000/api/v1`

All protected endpoints require `Authorization: Bearer <access_token>`.

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

| Method | Path                  | Description                  |
| ------ | --------------------- | ---------------------------- |
| GET    | `/transactions`       | List with pagination/filters |
| GET    | `/transactions/summary` | Balance summary (income − expenses) |
| GET    | `/transactions/:id`   | Get by ID                    |
| POST   | `/transactions`       | Create                       |
| PATCH  | `/transactions/:id`   | Update                       |
| DELETE | `/transactions/:id`   | Soft delete                  |

**Query parameters for `GET /transactions`:**

| Param       | Type    | Description                              |
| ----------- | ------- | ---------------------------------------- |
| `page`      | number  | Page number (default: 1)                 |
| `limit`     | number  | Items per page (default: 10, max: 500)   |
| `type`      | string  | `INCOME` or `EXPENSE`                    |
| `categoryId`| string  | Filter by category UUID                  |
| `startDate` | string  | ISO date — range start                   |
| `endDate`   | string  | ISO date — range end                     |
| `search`    | string  | Free-text search on description          |
| `sortBy`    | string  | Field to sort by (default: `date`)       |
| `sortOrder` | string  | `asc` or `desc` (default: `desc`)        |

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

| Method | Path               | Description                    |
| ------ | ------------------ | ------------------------------ |
| GET    | `/categories`      | List (filterable by `?type=`)  |
| GET    | `/categories/:id`  | Get by ID                      |
| POST   | `/categories`      | Create                         |
| PATCH  | `/categories/:id`  | Update                         |
| DELETE | `/categories/:id`  | Soft delete (non-default only) |

### Budgets

| Method | Path                    | Description                           |
| ------ | ----------------------- | ------------------------------------- |
| GET    | `/budgets`              | List budgets (`?month=5&year=2026`)   |
| GET    | `/budgets/alerts`       | Warning/exceeded alerts for a period  |
| GET    | `/budgets/:id`          | Get by ID                             |
| POST   | `/budgets`              | Create                                |
| PATCH  | `/budgets/:id`          | Update amount                         |
| DELETE | `/budgets/:id`          | Delete                                |

**Budget alert levels:**

| Level      | Condition          | Description                        |
| ---------- | ------------------ | ---------------------------------- |
| `warning`  | spent ≥ 80% limit  | Approaching budget limit           |
| `exceeded` | spent ≥ 100% limit | Budget has been exceeded           |

### Response Format

Success:

```json
{
  "success": true,
  "data": { ... }
}
```

Paginated:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

Error:

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

- **JWT Access Tokens**: short-lived (15 min), sent via `Authorization: Bearer` header
- **Refresh Tokens**: long-lived (7 days), stored in HTTP-only secure cookie and in the database
- **Refresh Token Rotation**: each `/auth/refresh` call issues a new token and revokes the old one
- **Rate Limiting**: 100 req/15 min globally; 10 req/15 min on auth endpoints
- **Helmet**: security headers (CSP, HSTS, XSS protection, etc.)
- **CORS**: explicit origin allowlist
- **User Isolation**: every repository query filters by `userId` extracted from the verified JWT payload
- **Input Validation**: Zod schemas enforced on every endpoint before reaching the service layer
- **Soft Deletes**: records are never permanently removed; `deletedAt` timestamp is set instead

## Testing

```bash
# Backend — unit + integration
cd backend && npm test

# Backend — with coverage report
cd backend && npm run test:coverage

# Frontend — unit tests
cd frontend && npm test

# Frontend — E2E (requires the full app running)
cd frontend && npm run test:e2e
```

## CI/CD

GitHub Actions runs on every push to `main` and `develop`:

1. **Lint** — ESLint + Prettier check (backend & frontend in parallel)
2. **Test** — Vitest with coverage (backend & frontend in parallel)
3. **Build** — TypeScript compilation + Next.js production build
4. **Docker** — validates both images build cleanly
5. **E2E** — Playwright against the full stack (main branch only)

## Architecture Decisions

### Backend

- **Repository pattern** decouples database queries from business logic, enabling easy testing via mocks
- **AppError class** provides typed, consistent error handling across all layers
- **Centralized error middleware** catches all errors in a single place (Zod, Prisma, AppError)
- **Soft deletes** on users, categories, and transactions preserve a full audit trail
- **Budget `spent` field** is recalculated synchronously on every transaction create/update/delete to avoid expensive aggregation queries on reads and to guarantee consistency

### Frontend

- **App Router route groups** `(auth)` and `(dashboard)` provide separate layouts without affecting the URL structure
- **ProtectedRoute + AuthGuard** components handle client-side route protection in both directions (redirect to login if not authenticated; redirect to dashboard if already authenticated)
- **Zustand auth store** with manual hydration and `_hasHydrated` flag prevents flash-redirects on page refresh
- **Axios interceptor** transparently refreshes the access token on 401 and retries the original request
- **React Query** manages all server state — Zustand is used only for client-side auth state
- **Feature-based structure** keeps components, hooks, and logic co-located by domain

## Production Deployment (Render + Vercel + Neon)

### 1. Neon (database)

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the **direct** connection string (not the pooler URL) — hostname without `-pooler`.
3. Append `?sslmode=require` if it is not already included.

### 2. Render (backend)

| Setting | Value |
| ------- | ----- |
| Root Directory | *(vacío — raíz del repo)* |
| Build Command | `npm ci && npx prisma migrate deploy && npm run build` |
| Start Command | `node dist/server.js` |
| Health Check Path | `/api/v1/health` |

> Si en los logs aparece `ach-finance@1.0.0 prepare` y `husky: not found`, el Root Directory está mal configurado o el build no usa el workspace del backend. Usa los comandos de arriba desde la **raíz** del repo.

**Environment variables:**

| Variable | Value |
| -------- | ----- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Neon direct connection string |
| `JWT_ACCESS_SECRET` | Random string (≥ 32 chars) |
| `JWT_REFRESH_SECRET` | Random string (≥ 32 chars) |
| `CORS_ORIGIN` | `https://your-app.vercel.app` (no trailing slash) |

Render sets `PORT` automatically — do not override it.

### 3. Vercel (frontend)

| Setting | Value |
| ------- | ----- |
| Root Directory | `frontend` |
| Framework | Next.js |

**Environment variable:**

| Variable | Value |
| -------- | ----- |
| `NEXT_PUBLIC_API_URL` | `https://your-service.onrender.com/api/v1` |

### 4. Post-deploy checklist

- Open `https://your-service.onrender.com/api/v1/health` — should return `{ "success": true }`.
- Register a new user on Vercel (or run `npx prisma db seed` once against Neon if you want the demo user).
- Confirm login works and the session persists (refresh cookie requires HTTPS + `sameSite=none` in production).

### Troubleshooting: P3009 (failed migration)

If deploy fails with `P3009` and `20260517053107_init`, a duplicate init migration ran against Neon.

1. In **Neon → SQL Editor**, run `backend/scripts/neon-fix-failed-migration.sql`.
2. Confirm `DATABASE_URL` on Render uses the **direct** host (no `-pooler` in the hostname).
3. Push the latest code (only one migration: `20260517000000_init`) and redeploy.

If the database is empty and you prefer a clean slate, reset the Neon branch from the dashboard and redeploy.

## License

MIT
