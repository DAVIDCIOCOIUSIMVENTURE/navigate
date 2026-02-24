# Database Management

## Environment Files

| File | Database | Port | Used for |
|------|----------|------|----------|
| `.env` | `navigate` | `5434` | Development |
| `.env.test` | `navigate_test` | `5434` | Testing (same container) |

---

## Docker Container Management

### Create the main dev container
```bash
docker run --name pg-navigate \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=navigate \
  -p 5434:5432 \
  -d postgres
```

### Create a separate test container (optional alternative)
Only needed if you want full isolation. Prefer the single-container approach below.
```bash
docker run --name pg-navigate-test \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=navigate_test \
  -p 5435:5432 \
  -d postgres
```

### Start / stop a container
```bash
docker start pg-navigate
docker stop pg-navigate
```

### Remove a container (destructive — deletes all data)
```bash
docker rm -f pg-navigate
docker rm -f pg-navigate-test
```

### View container logs
```bash
docker logs pg-navigate
docker logs pg-navigate-test
```

---

## Database Management (inside pg-navigate)

Preferred approach: run both `navigate` and `navigate_test` inside the same `pg-navigate` container.

### Create the test database
```bash
docker exec -it pg-navigate psql -U postgres -c "CREATE DATABASE navigate_test;"
```

### List all databases
```bash
docker exec -it pg-navigate psql -U postgres -c "\l"
```

### Drop the test database (destructive)
```bash
docker exec -it pg-navigate psql -U postgres -c "DROP DATABASE navigate_test;"
```

### Connect to a database interactively
```bash
# Dev
docker exec -it pg-navigate psql -U postgres -d navigate

# Test
docker exec -it pg-navigate psql -U postgres -d navigate_test
```

---

## Migrations

### Dev database
```bash
npx prisma migrate dev
# or via npm script:
npm run db:migrate
```

### Test database
```bash
npm run db:migrate:test
# equivalent to:
npx prisma migrate deploy --env-file .env.test
```

---

## Seeding

### Dev database
```bash
npm run seed
```

### Test database
```bash
npm run db:seed:test
# equivalent to:
npx prisma db seed --env-file .env.test
```

---

## Prisma Studio

### Dev database
```bash
npx prisma studio
```

### Test database
```bash
npm run db:studio:test
# equivalent to:
npx prisma studio --env-file .env.test
```

---

## Quick Setup: First-time test database setup

```bash
# 1. Create the test database inside the existing container
docker exec -it pg-navigate psql -U postgres -c "CREATE DATABASE navigate_test;"

# 2. Run migrations against it
npm run db:migrate:test

# 3. Seed it (optional)
npm run db:seed:test
```

---

## Testing Stack Notes

When the test suite is introduced, the `.env.test` file and `navigate_test` database are designed to work with:

| Technology | How it uses the test DB |
|------------|------------------------|
| **Vitest** | Vite auto-loads `.env.test` when `NODE_ENV=test`, so `DATABASE_URL` points to `navigate_test` automatically |
| **@testing-library/react** | Component tests — no direct DB access; use MSW to mock API routes |
| **MSW** | Mocks frontend API calls; bypasses DB entirely in component/unit tests |
| **DB isolation** | Use `vitest-environment-prisma` (Vitest-compatible) rather than `@quramy/jest-prisma` (Jest-only). Alternative: wrap each test in a transaction and rollback in `afterEach` |
| **Playwright** | Needs the app running against the test DB — configure `webServer.env` in `playwright.config.ts` with the test `DATABASE_URL` |
| **@vitest/coverage-v8** | No DB interaction — coverage of Vitest runs |

### DB isolation: recommended approach for Vitest

Option A — `vitest-environment-prisma`:
```bash
npm install -D vitest-environment-prisma
```

Option B — manual transaction rollback (no extra dependency):
```ts
// in test setup
beforeEach(async () => { await prisma.$executeRaw`BEGIN` })
afterEach(async () => { await prisma.$executeRaw`ROLLBACK` })
```
