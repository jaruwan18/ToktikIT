# TokTickIT — IT Service Desk

TokTickIT is an IT service desk web application for a university. Requesters submit and follow Tickets. IT Staff work a queue, record Actions Taken and move Tickets through a controlled workflow. Administrators manage user accounts. Both Requesters and IT Staff get role dashboards.

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Bootstrap 5 (Zen Green theme) |
| Backend | Node.js 22, Express, TypeScript, express-session |
| Database | PostgreSQL 16, Prisma 5 |
| Tests | Vitest + Supertest (API), Vitest + Testing Library (UI), Playwright (E2E) |

## Features by lab

| Lab | Features |
| --- | --- |
| Lab 1 | Project foundation, API health check, Ticket categories |
| Lab 2 | Create Ticket, My Tickets (search, filter, sort, pagination), Ticket Detail, attachments |
| Lab 3 | Login and first-login password change, IT Staff Ticket Queue and Ticket Detail, public comments, internal notes, IT Priority, Administrator user management |
| Lab 4 | Actions Taken on Ticket Detail, Ticket status workflow with resolution gate, Requester Dashboard, IT Staff Dashboard with drill-down |

Specifications live in `docs/lab-0N/`. The current ones are [specification.md](docs/lab-04/specification.md), [api-spec.md](docs/lab-04/api-spec.md), [ui-spec.md](docs/lab-04/ui-spec.md) and [tests.md](docs/lab-04/tests.md).

---

## Setup

Requirements: Node.js 22 and PostgreSQL 16 (or newer).

### 1. Database

Create a database and user that match `server/.env.example`. The default uses port 5433:

```sql
CREATE USER toktickit WITH PASSWORD 'toktickit' CREATEDB;
CREATE DATABASE toktickit OWNER toktickit;
```

`CREATEDB` is needed because `prisma migrate dev` creates a temporary shadow database.

### 2. Backend (`server`)

```bash
cd server
npm install
cp .env.example .env          # set DATABASE_URL, PORT and SESSION_SECRET
npx prisma migrate dev        # apply all migrations (Lab 1-4)
npx prisma db seed            # seed users, categories, systems and sample Tickets
npm run dev                   # API at http://localhost:3000
```

The seed is idempotent, so you can run it again at any time. It creates Tickets in all 8 statuses, with assigned and unassigned owners and with Actions Taken, so every dashboard metric has data.

### 3. Frontend (`client`)

```bash
cd client
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:3000
npm run dev                   # UI at http://localhost:5173
```

### Seeded accounts

All seeded accounts use the password `Password123!`.

| Role | Email | Notes |
| --- | --- | --- |
| Requester | jennifer.anderson@example.com | Has several Tickets |
| Requester | michael.brown@example.com, sarah.williams@example.com, david.miller@example.com | |
| Requester | emily.johnson@example.com | Inactive (login is rejected) |
| IT Staff | it.alex@example.com, it.jordan@example.com, it.taylor@example.com | |
| Administrator | admin@example.com | |

---

## Running the tests

Start PostgreSQL and seed the database first.

```bash
# API and integration tests (Lab 1-4), Vitest + Supertest
cd server
npm test

# UI component tests (Lab 1-4), Vitest + Testing Library
cd client
npm test
npm run build                 # type-check and production build
```

### End-to-end tests (Playwright)

The E2E tests run against the real app, so the server (`npm run dev` in `server`) and the client (`npm run dev` in `client`, port 5173) must both be running.

```bash
cd client
npx playwright install chromium            # first time only
npx playwright test -c ../playwright.config.ts --reporter=line
npx playwright test -c ../playwright.config.ts ../e2e/lab-04   # Lab 4 only
```

| Folder | Covers |
| --- | --- |
| `e2e/lab-02` | Requester creates a Ticket, My Tickets, Ticket Detail and attachments |
| `e2e/lab-03` | IT Staff login, queue, Ticket Detail, comments and notes, responsive queue |
| `e2e/lab-04` | Actions Taken flow, Ticket resolution workflow, dashboards and drill-down |

Each Lab 4 E2E test creates its own Ticket through the API, so the suite can be run repeatedly.

---

## Demonstration guide (Lab 4)

1. **Actions Taken:** log in as `it.alex@example.com`, open **IT Ticket Queue**, open a Ticket and use **Add Action Taken**. Try **Follow-Up Required?** without a note to see the validation message. Then log in as the Ticket's Requester: the Actions Taken list is visible but read-only.
2. **Ticket workflow:** on IT Staff Ticket Detail, **Change Status To** lists only the permitted next statuses. Choosing **Resolved** is rejected until the latest Action Taken has a description and a result.
3. **IT Staff Dashboard:** choose **Dashboard** as `it.alex@example.com`. Each metric card opens the IT Ticket Queue filtered to the same Tickets, with a "From dashboard" banner.
4. **Requester Dashboard:** choose **Dashboard** as `jennifer.anderson@example.com`. The cards count only that Requester's Tickets and open My Tickets with the same filter.

---

## Project structure

```text
client/            React app (src/components, tests/lab-0N)
server/            Express API (src, prisma schema/migrations/seed, tests/lab-0N)
e2e/               Playwright E2E tests per lab
docs/              Specifications, tests, reviewer and AI-use records per lab
artifacts/         Screenshots used as submission evidence
```

## Branch workflow

Feature branches (`feature/...`) are merged into the lab integration branch (`lab4-staging`) through reviewed pull requests, and the integration branch is merged into `main` at release. Each pull request links its GitHub Issue.
