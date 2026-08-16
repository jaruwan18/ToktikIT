# Lab 1 — AI Use and Reflection

**LLM/agent used:** Antigravity AI Coding Agent (Gemini 3.7 Flash, Thinking Level: High)

## Selected key prompts (6–10)
| # | Prompt (summarised) | What I did with the result |
|---|---------------------|----------------------------|
| 1 | Plan Issue 1 implementation without touching subsequent issues; audit all repository files and verify stack readiness against lab sheet. | Used the audit findings to confirm PostgreSQL and frontend/backend setup, creating a strict step-by-step implementation plan. |
| 2 | Proceed with Issue 1 technical foundation: configure client `tsconfig.json` with `noEmit: true`, clean compiled JS files, and write comprehensive `README.md`. | Verified clean build outputs on both client and server, and documented setup instructions for the project. |
| 3 | Implement Issue 2: create `GET /api/health` endpoint returning 200 with status ok and service name, integrate React status check and error handling, and run Supertest. | Verified that Supertest `API-01` passes and UI properly displays real backend status and error states. |
| 4 | Implement Issue 3: define Prisma Category model, run PostgreSQL migration to create table, and implement idempotent seed script using upsert. | Verified schema definition, migration generation, and confirmed seed script runs idempotently without duplicates. |

## Reflection
Structuring prompts with clear boundary constraints (e.g., explicitly instructing the agent not to implement features from future issues) ensured strict adherence to the incremental Git Flow required by the lab.
