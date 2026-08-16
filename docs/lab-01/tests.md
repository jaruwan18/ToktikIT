# Lab 1 — Test Plan and Evidence

All test files live under `server/tests/lab-01/` and `client/tests/lab-01/`.

| # | Test ID | Tool | Test Description | Result |
|---|---|------|------------------|:------:|
| 1 | API-01 | Supertest | GET /api/health returns 200, status=ok | **PASS** |
| 2 | API-02 | Supertest | GET /api/categories returns 4 seeded categories in id order | **PASS** |
| 3 | UI-01 | Vitest | TokTickIT heading renders | **PASS** |
| 4 | UI-02 | Vitest | Success state shows Online + category list | **PASS** |
| 5 | UI-03 | Vitest | Error state shows Offline + message | **PASS** |

---

## 📸 Test Execution Evidence

### 1. Backend Supertest Execution (`API-01` Health Check & `API-02` Category List):
```text
> toktickit-server@1.0.0 test
> vitest run

 RUN  v2.1.9 C:/Users/Donut/Downloads/Lab1_Starter_Scaffold/toktickit/server

 ✓ tests/lab-01/health.test.ts (1 test) 19ms
 ✓ tests/lab-01/categories.test.ts (1 test) 58ms

 Test Files  2 passed (2)
      Tests  2 passed (2)
   Start at  13:53:49
   Duration  13.40s (transform 67ms, setup 0ms, collect 417ms, tests 77ms, environment 0ms, prepare 177ms)
```

### 2. Frontend Vitest Execution (`UI-01`, `UI-02`, `UI-03` App UI Behavior):
```text
> toktickit-client@1.0.0 test
> vitest run

 RUN  v2.1.9 C:/Users/Donut/Downloads/Lab1_Starter_Scaffold/toktickit/client

 ✓ tests/lab-01/App.test.tsx (3 tests) 156ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  13:53:25
   Duration  13.88s (transform 99ms, setup 139ms, collect 179ms, tests 156ms, environment 876ms, prepare 143ms)
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
