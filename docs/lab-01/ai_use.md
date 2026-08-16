# Lab 1 — AI Use and Reflection

**LLM/agent used:** Antigravity AI Coding Agent (Gemini 3.7 Flash, Thinking Level: High)

## Selected key prompts (6–10)
| # | Prompt (summarised) | What I did with the result |
|---|---------------------|----------------------------|
| 1 | Plan Issue 1 implementation without touching subsequent issues; audit all repository files and verify stack readiness against lab sheet. | Used the audit findings to confirm PostgreSQL and frontend/backend setup, creating a strict step-by-step implementation plan. |
| 2 | Proceed with Issue 1 technical foundation: configure client `tsconfig.json` with `noEmit: true`, clean compiled JS files, and write comprehensive `README.md`. | Verified clean build outputs on both client and server, and documented setup instructions for the project. |
| 3 | Implement Issue 2: create `GET /api/health` endpoint returning 200 with status ok and service name, integrate React status check and error handling, and run Supertest. | Verified that Supertest `API-01` passes and UI properly displays real backend status and error states. |
| 4 | Configure PostgreSQL database connection via Docker container on port 5433 to avoid port conflict with Windows service. | Configured `DATABASE_URL` in `server/.env` and verified container connectivity. |
| 5 | Implement Issue 3: define Prisma Category model and run PostgreSQL migration to create table. | Verified schema definition and executed `npx prisma migrate dev --name init` to generate migration files. |
| 6 | Implement idempotent seed script in `server/prisma/seed.ts` using `prisma.category.upsert()`. | Verified seed execution and ran consecutive seeds to ensure no duplicate rows are created. |
| 7 | Refine PR description and address peer review feedback: clean boilerplate comments from `seed.ts`, export `CATEGORIES` constant, and add migration/seed steps to `README.md`. | Applied reviewer feedback to ensure codebase cleanliness and updated documentation. |
| 8 | Implement Issue 4: create `GET /api/categories` endpoint returning categories ordered by id, connect React client to fetch and render categories with loading and error states, and write Supertest (API-02) and Vitest (UI-01, UI-02, UI-03) automated tests. | Verified all Supertest API tests and Vitest UI tests pass with 100% success rate. |

## Reflection
Using AI coding agents effectively requires defining strict scope boundaries to prevent premature implementation across sequential Git Flow issues. When configuring the database, I intervened and corrected the agent's connection approach by redirecting to a Docker container on port 5433, avoiding port conflicts with local Windows services. Furthermore, I refined the AI's generated pull request descriptions to remain formal, concise, and aligned with standard software engineering practices.
