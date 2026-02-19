# Implementation Plan: Core Application Features

**Branch**: `001-core-features` | **Date**: 2026-02-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-features/spec.md`

## Summary

Full-stack PWA expenses tracker with email/password authentication, expense logging by category,
spending reports as a horizontal bar chart, custom categories, recurring monthly expenses, and
account sharing between two users. Built with Next.js 16.1.6 (App Router) frontend and Fastify 5.7.4
backend, both in TypeScript strict mode, backed by PostgreSQL via Prisma on Neon.

## Technical Context

**Language/Version**: TypeScript 5.9.3 strict; Node.js 20 LTS (backend); Next.js 16.1.6 (frontend)
**Primary Dependencies**:
- Backend: Fastify 5.7.4, Prisma 5.21.1, @fastify/cookie 11.0.2, @fastify/cors 11.2.0, @fastify/helmet 13.0.2, Zod 4.3.6, jose 6.1.3 (JWT signing/verification), bcryptjs 3.0.3
- Frontend: Next.js 16.1.6 (App Router), React 19.2.4, Tailwind CSS 4.2.0, Zod 4.3.6, Recharts 3.7.0
- PWA: native Next.js manifest via `app/manifest.ts` — no external library needed (see research.md)
- Shared: workspace package `shared/` with Zod schemas + inferred TypeScript types

**Storage**: PostgreSQL via Neon serverless free tier; Prisma as ORM; Neon connection pooler for
serverless/edge compatibility
**Testing**: Vitest 4.0.18 (backend integration + unit; frontend component); Playwright 1.58.2 (E2E); @testing-library/react 15.1.0
**Target Platform**: Web PWA — installable on mobile + desktop; backend on Fly.io free tier
**Project Type**: Web application — separate `backend/` and `frontend/` + `shared/` workspace pkg
**Performance Goals**: LCP ≤2.5 s (mid-range mobile, 4G); Lighthouse PWA ≥90; reports render <2 s
for 24 months of data; API p95 <300 ms for expense queries
**Constraints**: Zero-cost deployment (Vercel + Fly.io + Neon free tiers); max 2 users per account;
no third-party auth providers in v1 (extensible for future OAuth)
**Scale/Scope**: Personal/household — 1–2 users per account; ~10–20 categories; hundreds of
expenses/month per account

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Type Safety | ✅ PASS | TypeScript strict on both sides; Zod validation at all API boundaries; Prisma-generated types for DB layer; shared Zod schemas via workspace package |
| II | Security & Data Privacy | ✅ PASS | Stateless JWT: access tokens (≤15 min, HS256) + refresh tokens (30d, HS256), both verified by signature only — no server-side token storage; HttpOnly + Secure + SameSite=Strict cookies; bcryptjs for passwords; Prisma parameterized queries; sensitive fields excluded from logs |
| III | Test Coverage | ✅ PASS | Vitest everywhere; Fastify `inject` for route integration tests; contract tests for every API endpoint; Playwright E2E for critical flows |
| IV | Simplicity | ✅ PASS | Stateless JWT removes the RefreshToken DB table and reuse-detection logic entirely — simpler than the previous stateful design. Framework primitives throughout; `shared/` package is the simplest way to share types without code generation |
| V | Installable App (Manifest) | ✅ PASS | Native Next.js `app/manifest.ts` for Web App Manifest; responsive Tailwind layout; no service worker in v1 (offline/caching deferred) |

**Pre-research verdict**: All gates pass. No violations to track.

## Project Structure

### Documentation (this feature)

```text
specs/001-core-features/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── openapi.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── plugins/          # Fastify plugins: auth, cookie, cors, helmet
│   ├── routes/           # Route handlers grouped by domain
│   │   ├── auth/
│   │   ├── expenses/
│   │   ├── categories/
│   │   ├── recurring/
│   │   └── accounts/
│   ├── services/         # Business logic (auth, expenses, categories, recurring, accounts)
│   └── lib/              # JWT helpers, password hashing, shared utilities
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── integration/      # Per-route integration tests via Fastify inject
│   └── contract/         # Contract tests matching OpenAPI spec
├── package.json
└── tsconfig.json

frontend/
├── src/
│   ├── app/              # Next.js App Router: pages and layouts
│   │   ├── (auth)/       # Login + register pages (unauthenticated route group)
│   │   └── (app)/        # Protected pages: main, reports, categories, recurring, account
│   ├── components/       # Shared UI components
│   ├── services/         # Typed API client (fetch wrappers)
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Constants, icon/color predefined sets, utilities
├── tests/
│   ├── components/       # Vitest + React Testing Library
│   └── e2e/              # Playwright E2E tests
├── public/               # PWA icons
├── package.json
└── tsconfig.json

shared/                   # Workspace package: Zod schemas + inferred TypeScript types
├── src/
│   └── schemas/          # Per-domain schemas: auth, expense, category, recurring, account
└── package.json
```

**Structure Decision**: Web application (Option 2) with an additional `shared/` workspace package.
The `shared/` package is the simplest mechanism to keep frontend/backend types in sync without
requiring a code generation step — both import Zod schemas and derive TypeScript types from them
via `z.infer<>`.

## Complexity Tracking

> No violations identified — all gates passed. Stateless JWT (constitution v2.0.0 Principle II)
> reduces complexity vs. the previous stateful design by eliminating the RefreshToken table and
> reuse-detection logic.
