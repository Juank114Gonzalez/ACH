-- Run this in the Neon SQL Editor if deploy fails with P3009
-- (failed migration 20260517053107_init — duplicate init that was removed from the repo)

-- 1. Remove the failed migration record
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20260517053107_init';

-- 2. Verify state (should show only 20260517000000_init as finished, or empty if fresh DB)
SELECT migration_name, finished_at, rolled_back_at, logs
FROM "_prisma_migrations"
ORDER BY started_at;
