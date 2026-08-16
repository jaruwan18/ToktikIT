# TokTickIT — Full-Stack Hello World Starter (Lab 1)

TokTickIT is an IT service desk web application built with:
- **Frontend**: React + TypeScript + Vite + Bootstrap
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Testing**: Vitest + Supertest

---

## 🛠️ Setup Instructions

### 1. Backend Setup (`server`)
```bash
cd server
npm install
cp .env.example .env    # Configure DATABASE_URL (PostgreSQL)
npx prisma migrate dev  # Run migrations
npm run prisma:seed     # Seed initial categories
npm run dev             # Starts API at http://localhost:3000
```

### 2. Frontend Setup (`client`)
```bash
cd client
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:3000
npm run dev             # Starts UI at http://localhost:5173
```

---

## 🧪 Running Automated Tests

```bash
# Run Backend Supertest (API-01, API-02)
cd server
npm test

# Run Frontend Vitest (UI-01, UI-02, UI-03)
cd client
npm test
```