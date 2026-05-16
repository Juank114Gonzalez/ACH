# Architecture Decision Records

## ADR-001: Clean Layered Architecture for Backend

**Status**: Accepted  
**Context**: Need a maintainable, testable backend structure  
**Decision**: Implement Routes → Controllers → Services → Repositories → Database  
**Consequences**:  
- Each layer has a single responsibility  
- Services can be unit-tested by mocking repositories  
- Database can be swapped without touching business logic

## ADR-002: Prisma as ORM

**Status**: Accepted  
**Context**: Need type-safe database access with migrations  
**Decision**: Prisma ORM with PostgreSQL  
**Consequences**:  
- Auto-generated TypeScript types from schema  
- Migration history as code  
- Schema as single source of truth

## ADR-003: JWT with Refresh Token Rotation

**Status**: Accepted  
**Context**: Need stateless auth with revocation capability  
**Decision**: Short-lived access tokens (15m) + long-lived refresh tokens (7d) stored in DB and HTTP-only cookies  
**Consequences**:  
- Access tokens cannot be revoked (acceptable given 15m lifetime)  
- Refresh tokens can be revoked (logout-all, suspicious activity)  
- Each refresh issues a new token (rotation prevents token theft)

## ADR-004: React Query for Server State

**Status**: Accepted  
**Context**: Need efficient data fetching, caching, and synchronization  
**Decision**: TanStack React Query v5 for all server state  
**Consequences**:  
- Automatic background refetch, stale-while-revalidate  
- Cache invalidation on mutations  
- No need for Redux/Context for remote data

## ADR-005: Feature-Based Frontend Structure

**Status**: Accepted  
**Context**: Need a scalable, maintainable frontend architecture  
**Decision**: Features are self-contained modules under `src/features/`  
**Consequences**:  
- Each feature owns its components, and logic  
- Easy to add/remove features independently  
- Clear boundaries prevent accidental coupling

## ADR-006: Budget `spent` Denormalization

**Status**: Accepted  
**Context**: Calculating spent amounts via aggregation on every read is expensive  
**Decision**: Store `spent` on the Budget record and recalculate on transaction writes  
**Consequences**:  
- Read performance is optimal (no JOIN/aggregation)  
- Write complexity is slightly higher  
- `spent` is always consistent because it's recalculated transactionally

## ADR-007: Soft Deletes

**Status**: Accepted  
**Context**: Financial data must not be permanently destroyed  
**Decision**: `deletedAt` timestamp on users, categories, and transactions  
**Consequences**:  
- Data is never lost  
- All queries must filter `WHERE deletedAt IS NULL`  
- Enables potential data recovery feature
