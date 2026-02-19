# expenses-tracker Development Guidelines

Auto-generated from feature plans. Last updated: 2026-02-19

## Active Technologies
- TypeScript 5.9.3 strict; Node.js 20 LTS (backend); Next.js 16.1.6 (frontend) (001-core-features)
- PostgreSQL via Neon serverless free tier; Prisma as ORM; Neon connection pooler for (001-core-features)

### Frontend (`frontend/`)
- Next.js 16.1.6 (App Router), React 19.2.4, TypeScript 5.9.3 strict
- Tailwind CSS 4.2.0, Recharts 3.7.0 (horizontal bar charts)
- PWA manifest via `app/manifest.ts` — native Next.js, no external library (service worker deferred)
- Zod 4.3.6 (shared validation schemas from `shared/`)

### Backend (`backend/`)
- Node.js 20 LTS, Fastify 5.7.4, TypeScript 5.9.3 strict
- Prisma 5.21.1 + PostgreSQL (Neon serverless free tier)
- jose 6.1.3 (JWT signing/verification), bcryptjs 3.0.3 (password hashing)
- @fastify/cookie 11.0.2, @fastify/cors 11.2.0, @fastify/helmet 13.0.2
- Zod 4.3.6 (shared validation schemas from `shared/`)

### Shared (`shared/`)
- Zod 4.3.6 schemas + `z.infer<>` TypeScript types; imported by both workspaces

### Testing
- Vitest 4.0.18 — backend integration tests + frontend component tests
- @testing-library/react 15.1.0 — frontend component tests
- Playwright 1.58.2 — E2E tests (`frontend/tests/e2e/`)

### Deployment (zero-cost)
- Frontend → Vercel free tier
- Backend → Fly.io free tier
- Database → Neon PostgreSQL free tier

## Project Structure

```text
backend/
├── src/
│   ├── plugins/    # Fastify plugins: auth, cookie, cors, helmet
│   ├── routes/     # auth/, expenses/, categories/, recurring/, accounts/
│   ├── services/   # Business logic
│   └── lib/        # JWT helpers, password hashing, utilities
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── tests/
    ├── integration/
    └── contract/

frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/     # Login + register (unauthenticated)
│   │   └── (app)/      # Protected: main, reports, categories, recurring, account
│   ├── components/
│   ├── services/       # Typed API client
│   ├── hooks/
│   └── lib/            # Icon/color sets, constants
└── tests/
    ├── components/
    └── e2e/

shared/
└── src/schemas/        # Zod schemas per domain
```

## Commands

```bash
pnpm install                              # install all workspaces
pnpm --filter backend dev                 # backend dev server (port 4000)
pnpm --filter frontend dev                # frontend dev server (port 3000)
pnpm test                                 # run all tests
pnpm --filter backend test                # backend tests only
pnpm --filter frontend test               # frontend tests only
pnpm --filter frontend test:e2e           # Playwright E2E
pnpm --filter backend exec prisma migrate dev  # run DB migrations
pnpm --filter backend exec prisma db seed      # seed system categories
```

## Code Style

- TypeScript strict mode everywhere — no implicit `any`
- Zod validation at all API boundary inputs (never trust raw request body)
- Prisma for all DB access — no raw SQL string interpolation
- HttpOnly + Secure + SameSite=Strict cookies for auth tokens
- `credentials: 'include'` on all frontend fetch calls (cookie-based auth)

## Constitution

See `.specify/memory/constitution.md` for the full project constitution (v2.0.0).
Key non-negotiables: Type Safety, Security & Data Privacy, Test Coverage, Simplicity, PWA.
Auth: stateless JWT — access tokens (≤15 min) + refresh tokens (30 days), signature-only,
no server-side token storage. Logout clears cookies client-side only.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

## Recent Changes
- 001-core-features: Added TypeScript 5.9.3 strict; Node.js 20 LTS (backend); Next.js 16.1.6 (frontend)
