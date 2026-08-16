# TokTickIT — Full-Stack IT Service Desk

TokTickIT is an IT service desk web application designed for handling Account & Access, Hardware, Software, and Network requests.
This project is built with a modern full-stack architecture:
- **Frontend**: React + TypeScript + Vite + Bootstrap
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Testing**: Vitest (Frontend unit tests) + Supertest (Backend API tests)

---

## Repository Structure

```text
toktickit/
├── client/                     # Frontend Application
│   ├── src/                    # React source code (TypeScript)
│   ├── tests/                  # Frontend tests (Vitest)
│   ├── .env.example            # Client environment variables template
│   ├── package.json            # Client dependencies & scripts
│   ├── tsconfig.json           # Client TypeScript configuration
│   └── vite.config.ts          # Vite build & Vitest configuration
├── server/                     # Backend Application
│   ├── prisma/                 # Prisma schema and seed scripts
│   ├── src/                    # Express REST API routes & app setup
│   ├── tests/                  # Backend API tests (Supertest)
│   ├── .env.example            # Server environment variables template
│   ├── package.json            # Server dependencies & scripts
│   └── tsconfig.json           # Server TypeScript configuration
├── docs/                       # Course Documentation & Reports
│   └── lab-01/
│       ├── ai_use.md           # Record of AI prompts and reflections
│       ├── reviewer.md         # Peer review records
│       └── tests.md            # Test execution plan and evidence
├── .gitignore                  # Git ignore rules for node_modules & secrets
└── README.md                   # Project overview and setup instructions
```

---

##  Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **PostgreSQL** running locally on default port `5432`

---

### 1. Backend Setup (`server`)

1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create the environment configuration file:
   ```bash
   # Windows PowerShell:
   Copy-Item .env.example .env

   # macOS / Linux:
   cp .env.example .env
   ```
   Ensure `.env` contains your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://toktickit:toktickit@localhost:5432/toktickit?schema=public"
   PORT=3000
   ```

4. Run database migrations and seed initial categories:
   ```bash
   npx prisma migrate dev
   npm run prisma:seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will start at `http://localhost:3000`.

---

### 2. Frontend Setup (`client`)

1. Open another terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Create the environment configuration file:
   ```bash
   # Windows PowerShell:
   Copy-Item .env.example .env

   # macOS / Linux:
   cp .env.example .env
   ```
   Ensure `.env` points to the backend API:
   ```env
   VITE_API_URL="http://localhost:3000"
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The Vite dev server will start at `http://localhost:5173`.

---

##  Running Tests

### Frontend Tests (Vitest)
```bash
cd client
npm test
```

### Backend Tests (Vitest + Supertest)
```bash
cd server
npm test
```

---

## Production Build

### Build Frontend
```bash
cd client
npm run build
```

### Build Backend
```bash
cd server
npm run build
```