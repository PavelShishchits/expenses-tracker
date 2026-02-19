# Quickstart: Core Application Features

**Branch**: `001-core-features` | **Date**: 2026-02-19

## Prerequisites

- Node.js 20 LTS (`node -v` → `v20.x.x`) — required for Next.js 16 and Fastify 5
- pnpm 9+ (`pnpm -v`) — used as the workspace package manager
- A [Neon](https://neon.tech) account (free tier) with a project created
- Git

## Repository Structure

```
expenses-tracker/
├── backend/        # Fastify API server
├── frontend/       # Next.js PWA
└── shared/         # Zod schemas + TypeScript types (workspace package)
```

This is a **pnpm workspace** monorepo. Always run install from the root.

## 1. Clone & Install

```bash
git clone <repo-url> expenses-tracker
cd expenses-tracker
pnpm install       # installs all workspaces: backend, frontend, shared
```

## 2. Environment Setup

### Backend (`backend/.env`)

```env
# PostgreSQL (Neon pooled connection string)
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/expenses?sslmode=require&connection_limit=5"

# JWT secrets — generate with: openssl rand -hex 32
# Access token (≤15 min TTL) and refresh token (30d TTL) use separate secrets.
# Auth is stateless — tokens are verified by signature only, no DB storage.
JWT_ACCESS_SECRET="<32-byte-hex>"
JWT_REFRESH_SECRET="<32-byte-hex>"

# Server
PORT=4000
NODE_ENV=development

# CORS — Next.js dev server
CORS_ORIGIN="http://localhost:3000"
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## 3. Database Setup

```bash
# Generate Prisma client
pnpm --filter backend exec prisma generate

# Run migrations (creates tables)
pnpm --filter backend exec prisma migrate dev --name init

# Seed system categories
pnpm --filter backend exec prisma db seed
```

Verify with Prisma Studio (optional):
```bash
pnpm --filter backend exec prisma studio
# Opens at http://localhost:5555
```

## 4. Run Locally

Open two terminals:

**Terminal 1 — Backend:**
```bash
pnpm --filter backend dev
# API running at http://localhost:4000
# Health check: GET http://localhost:4000/health
```

**Terminal 2 — Frontend:**
```bash
pnpm --filter frontend dev
# App running at http://localhost:3000
```

> **Note**: The app uses a Web App Manifest for home screen installability (no service worker in v1).
> Manifest is served automatically by Next.js at `/.well-known/manifest.json`.

## 5. Run Tests

```bash
# All workspaces
pnpm test

# Backend only (Vitest — integration + contract tests)
pnpm --filter backend test

# Frontend only (Vitest + React Testing Library)
pnpm --filter frontend test

# E2E (Playwright — requires both servers running)
pnpm --filter frontend test:e2e

# Watch mode (backend)
pnpm --filter backend test:watch
```

Coverage reports:
```bash
pnpm --filter backend test:coverage
pnpm --filter frontend test:coverage
```

## 6. Verify the Happy Path

After setup, confirm the core flow works:

1. **Register**: `POST http://localhost:4000/auth/register` with `{"email":"test@example.com","password":"password123"}`
2. **Login**: open `http://localhost:3000` and log in
3. **Log expense**: select a category on the main page, enter an amount, save
4. **Check report**: navigate to Reports — the expense should appear in the current month

## 7. Build for Production

```bash
# Backend
pnpm --filter backend build    # Outputs to backend/dist/

# Frontend
pnpm --filter frontend build   # Outputs Next.js .next/ build with PWA service worker
```

## 8. Deploy

| Service   | Target     | Command / Notes |
|-----------|------------|-----------------|
| Frontend  | Vercel     | Connect GitHub repo; root = `frontend/`; env vars from `frontend/.env.local` |
| Backend   | Fly.io     | `fly deploy` from `backend/`; set secrets with `fly secrets set KEY=value` |
| Database  | Neon       | Already provisioned; update `DATABASE_URL` in Fly.io secrets |

Production environment variables to set in Fly.io:
```
DATABASE_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
CORS_ORIGIN   # set to your Vercel frontend URL
NODE_ENV=production
```

## Common Issues

| Problem | Solution |
|---------|----------|
| `prisma migrate dev` fails | Check `DATABASE_URL` in `backend/.env`; ensure Neon project is active |
| CORS errors in browser | Verify `CORS_ORIGIN` in backend matches the frontend URL exactly |
| Cookies not sent | Ensure `credentials: 'include'` on all frontend fetch calls |
| PWA not installing | Must use `pnpm build && pnpm start`; HTTPS required in production |
