# Lab 1 — Test Plan and Evidence

All test files live under `server/tests/lab-01/` and `client/tests/lab-01/`.

| # | Test ID | Tool | Test Description | Result |
|---|---|------|------------------|:------:|
| 1 | API-01 | Supertest | GET /api/health returns 200, status=ok | Pending (Issue 2) |
| 2 | API-02 | Supertest | GET /api/categories returns 4 seeded categories in id order | Pending (Issue 4) |
| 3 | UI-01 | Vitest | TokTickIT heading renders | **PASS** |
| 4 | UI-02 | Vitest | Success state shows Online + category list | Pending (Issue 4) |
| 5 | UI-03 | Vitest | Error state shows Offline + message | Pending (Issue 4) |

---

## 📸 Test Execution Evidence (Issue 1)

### Client Vitest Execution:
```text
> toktickit-client@1.0.0 test
> vitest run

 RUN  v2.1.9 C:/Users/Donut/Downloads/Lab1_Starter_Scaffold/toktickit/client

 ✓ tests/lab-01/App.test.tsx (3 tests | 2 skipped) 17ms

 Test Files  1 passed (1)
      Tests  1 passed | 2 todo (3)
   Start at  22:04:12
   Duration  11.15s (transform 35ms, setup 138ms, collect 127ms, tests 17ms, environment 791ms, prepare 99ms)
```
