# Lab 1 — Test Plan and Evidence

All test files live under `server/tests/lab-01/` and `client/tests/lab-01/`.

| # | Test ID | Tool | Test Description | Result |
|---|---|------|------------------|:------:|
| 1 | API-01 | Supertest | GET /api/health returns 200, status=ok | **PASS** |
| 2 | API-02 | Supertest | GET /api/categories returns 4 seeded categories in id order | Pending (Issue 4) |
| 3 | UI-01 | Vitest | TokTickIT heading renders | **PASS** |
| 4 | UI-02 | Vitest | Success state shows Online + category list | Pending (Issue 4) |
| 5 | UI-03 | Vitest | Error state shows Offline + message | Pending (Issue 4) |

---

## 📸 Test Execution Evidence

### 1. Backend Supertest Execution (`API-01` Health Check):
```text
> toktickit-server@1.0.0 test
> vitest run

 RUN  v2.1.9 C:/Users/Donut/Downloads/Lab1_Starter_Scaffold/toktickit/server

 ✓ tests/lab-01/health.test.ts (1 test) 17ms

 Test Files  1 passed | 1 skipped (2)
      Tests  1 passed | 1 todo (2)
   Start at  23:00:07
   Duration  10.41s (transform 50ms, setup 0ms, collect 292ms, tests 17ms, environment 0ms, prepare 127ms)
```

### 2. Frontend Vitest Execution (`UI-01` Heading Render):
```text
> toktickit-client@1.0.0 test
> vitest run

 RUN  v2.1.9 C:/Users/Donut/Downloads/Lab1_Starter_Scaffold/toktickit/client

 ✓ tests/lab-01/App.test.tsx (3 tests | 2 skipped) 16ms

 Test Files  1 passed (1)
      Tests  1 passed | 2 todo (3)
   Start at  22:59:25
   Duration  10.17s (transform 45ms, setup 60ms, collect 91ms, tests 16ms, environment 346ms, prepare 65ms)
```

### 3. Database Migration & Seed Idempotency Execution (Issue 3):
```text
> toktickit-server@1.0.0 prisma:migrate
> npx prisma migrate dev --name init

Applying migration `20260816061657_init`
The following migration(s) have been created and applied from new schema changes:
migrations/
  └─ 20260816061657_init/
    └─ migration.sql

Your database is now in sync with your schema.

# First Seed Run:
> toktickit-server@1.0.0 prisma:seed
> tsx prisma/seed.ts

Seeded 4 categories successfully.

# Second Seed Run (Idempotency verification):
> toktickit-server@1.0.0 prisma:seed
> tsx prisma/seed.ts

Seeded 4 categories successfully.
```
