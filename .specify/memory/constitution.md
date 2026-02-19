<!--
SYNC IMPACT REPORT
==================
Version change:       1.1.0 → 2.0.0
Bump type:            MAJOR — Principle II fundamentally redefined: server-side refresh token
                      storage, rotation-on-use, and reuse detection requirements removed.
                      Auth model changed from stateful (DB-backed token table) to stateless
                      (signature-only JWT). Breaks backward compatibility with plan.md
                      (RefreshToken schema, familyId, usedAt fields) and research.md
                      (reuse detection flow documentation).
Modified principles:  II. Security & Data Privacy — auth mechanism rewritten for stateless JWT

Templates reviewed:
  ✅ .specify/templates/plan-template.md  — generic; no Principle-II-specific content
  ✅ .specify/templates/spec-template.md  — generic; no auth-specific content
  ✅ .specify/templates/tasks-template.md — generic; no auth-specific content
  ✅ CLAUDE.md                            — constitution version reference updated

Feature artifacts requiring manual update (not templates):
  ⚠ specs/001-core-features/plan.md      — remove RefreshToken dependency; update auth section
  ⚠ specs/001-core-features/research.md  — rewrite JWT section: remove reuse detection pattern,
                                           remove RefreshToken Prisma model, document stateless flow
  ⚠ specs/001-core-features/tasks.md     — remove RefreshToken schema/migration tasks; remove
                                           reuse-detection service task from Phase 2 foundational

Follow-up TODOs:
  - Re-run /speckit.plan to regenerate plan.md and research.md with stateless auth design
  - Re-run /speckit.tasks to regenerate tasks.md without RefreshToken foundational tasks
  - data-model.md: Remove RefreshToken entity entirely
  - contracts/openapi.yaml: POST /auth/refresh endpoint remains; remove any reuse-detection
    response codes (e.g., 401 "token family revoked") if present
-->

# Expenses Tracker Constitution

## Core Principles

### I. Type Safety (NON-NEGOTIABLE)

All code MUST be written in TypeScript with strict mode enabled (`"strict": true`).
Implicit `any` is prohibited; explicit `any` requires an inline justification comment.
Type definitions shared between frontend and backend MUST be maintained in a shared
package or generated from a contract-first source (e.g., OpenAPI schema types). Data
arriving from external boundaries (API responses, database query results, user input)
MUST be validated and narrowed to known types before use — runtime assumptions are not
acceptable substitutes for type guarantees.

**Rationale**: Expense data flows across the frontend/backend boundary continuously;
silent type mismatches produce incorrect calculations or corrupt records that are hard
to detect and costly to recover from.

### II. Security & Data Privacy (NON-NEGOTIABLE)

All user financial data MUST be treated as sensitive at every layer:

- Authentication MUST use short-lived JWT access tokens (≤15 min TTL) paired with
  refresh tokens (30-day TTL). Both tokens are verified by cryptographic signature
  only — no server-side token state is stored or required (stateless auth).
- Both token types MUST be stored in HttpOnly, Secure, SameSite=Strict cookies;
  localStorage token storage is prohibited.
- Logout MUST clear all auth cookies client-side. No server-side revocation is
  required; the access token's short TTL bounds the post-logout validity window to
  ≤15 minutes. Multi-device session revocation is out of scope for v1.
- Passwords MUST be hashed with bcrypt or Argon2; plaintext passwords MUST never be
  logged, stored, or transmitted after initial receipt.
- Every API endpoint MUST verify authorization; no route is implicitly public.
- All database queries MUST use parameterized statements; string-interpolated SQL is
  prohibited without exception.
- Sensitive values (tokens, hashed passwords, PII) MUST be excluded from logs and
  error responses returned to clients.
- HTTPS MUST be enforced in all environments; no HTTP-only deployments are permitted.

**Rationale**: Expense records reveal personal financial behavior. A breach violates
user trust and may carry legal obligations (GDPR, local financial data regulations).
Stateless JWT eliminates the need for a token database table, reducing backend
complexity and infrastructure requirements. The ≤15 min access token TTL limits the
post-logout exposure window; a 30-day refresh token verified by signature only provides
seamless long-lived sessions without server-side session state.

### III. Test Coverage

Solid, meaningful test coverage MUST exist for both backend and frontend. Coverage is a
floor, not a goal — tests MUST cover real scenarios, not just inflate metrics.

- **Backend**: ≥80% line coverage on business logic (services, models, validation).
  Every API route MUST have at least one integration test exercising a real request
  through the full middleware stack.
- **Frontend**: All critical user flows (authentication, expense creation, editing,
  deletion, dashboard) MUST have component or E2E tests. Pure UI chrome is exempt.
- **Contract tests**: MUST exist for every API endpoint consumed by the frontend;
  these tests own the frontend/backend integration boundary.
- **CI gate**: Tests, type-check, and lint MUST all pass on every PR. A PR with
  failing tests MUST NOT be merged under any circumstance.
- **Test runner**: Vitest is the exclusive test runner for both backend and frontend.

**Rationale**: Financial applications require high confidence in correctness over time.
Regressions in calculations or auth flows cause real user harm. A single test runner
across the stack reduces configuration overhead and keeps CI setup consistent.

### IV. Simplicity & Incremental Delivery

Each feature MUST be implemented as the simplest solution that satisfies its acceptance
criteria. Speculative abstractions, premature generalization, and unnecessary dependencies
are prohibited. New complexity MUST be justified in the implementation plan before any
code is written.

- Prefer framework primitives and standard library over custom solutions.
- Introduce a new dependency only when the existing toolset demonstrably cannot meet the
  need; document the decision in the plan.
- Deliver features in independently testable, independently deployable increments aligned
  to user stories.
- Complexity violations (deviations from this principle) MUST be tracked in the
  Complexity Tracking section of the feature's `plan.md`.

**Rationale**: Expense trackers accrete technical debt quickly when developers over-
engineer early. Simplicity keeps the codebase maintainable and features shippable.

### V. Installable App (Manifest)

The frontend MUST be installable to the home screen on mobile and desktop:

- A valid Web App Manifest MUST be present, served via Next.js `app/manifest.ts`.
- The manifest MUST include a name, short name, start URL, display mode (`standalone`),
  theme colour, background colour, and icon assets (192×192 and 512×512 PNG minimum).
- The application MUST be fully responsive across mobile, tablet, and desktop viewports.
- Performance budget: LCP ≤2.5 s on a mid-range mobile device on a simulated 4G connection.

**Deferred to future iteration**: Service worker, offline caching, background sync, and
push notifications. When offline support is prioritised, use Serwist (`@serwist/next`).

**Rationale**: Home screen installability delivers a native app-like experience without
app store overhead. The manifest-only approach satisfies installability requirements for v1
without the complexity of a service worker, which will be added incrementally.

## Technology Stack

Choices below are the established defaults. Deviations MUST be documented with
justification in the feature's `plan.md` before implementation begins.

- **Frontend**: Next.js (App Router), TypeScript strict, Tailwind CSS.
- **Backend**: Node.js with Fastify, TypeScript strict.
- **Database**: PostgreSQL; access via a typed ORM or query builder (e.g., Prisma or
  Drizzle). Raw SQL MUST use the ORM's parameterized query API.
- **Authentication**: JWT access tokens (≤15 min TTL) + refresh tokens (30-day TTL),
  both verified by cryptographic signature only — stateless, no server-side token
  storage. Stored in HttpOnly, Secure, SameSite=Strict cookies.
- **Testing**: Vitest for all test types across backend and frontend.
  - Backend: Vitest + a Fastify test helper for integration tests.
  - Frontend: Vitest + React Testing Library for component tests; Playwright for E2E.
- **CI/CD**: Tests, type-check, and lint run on every PR; coverage gates enforced.
- **PWA**: Web App Manifest via native Next.js `app/manifest.ts` (no external library).
  Service worker deferred — use `@serwist/next` when offline support is added.
- **Deployment (zero-cost)**:
  - Frontend: Vercel free tier (native Next.js support, no cold starts).
  - Backend: Fly.io free tier (always-on container, preferred over Render free tier
    which sleeps after inactivity).
  - Database: Neon (serverless PostgreSQL free tier) or Supabase free tier.

## Development Workflow

- All features MUST begin with a specification (`spec.md`) and implementation plan
  (`plan.md`) before any code is written. Skipping planning for "small" features is
  not permitted.
- Every PR MUST pass a self-review covering: type safety, security checklist (no secrets
  committed, no raw SQL, auth on all routes), test coverage, and constitution compliance.
- Merging to `main` requires: all CI checks passing and at least one peer approval.
- Database schema changes MUST include a reversible migration script.
- Breaking API changes MUST be versioned. Frontend and backend deployments involving a
  breaking change MUST be coordinated (not deployed independently).
- Secrets and credentials MUST NEVER be committed to the repository; use environment
  variables and a secrets manager (e.g., Doppler, Infisical, or platform-native secrets).

## Governance

This constitution supersedes all other development practices for this project.
Amendments require:

1. A written proposal describing the change and its rationale.
2. Review and approval before the change takes effect.
3. A version bump following the policy below, applied to this file.
4. Propagation of any impacted guidance to affected templates and documentation.

**Versioning policy**:

- **MAJOR**: Principle removal, fundamental redefinition, or governance restructuring
  that breaks backward compatibility with existing plans or specs.
- **MINOR**: New principle or material section added; existing principle materially
  expanded with new non-negotiable rules.
- **PATCH**: Clarifications, wording improvements, or non-semantic refinements.

All PRs and code reviews MUST verify compliance with Principles I–V. Violations of
Principle IV (Simplicity) MUST be documented in the Complexity Tracking section of the
relevant `plan.md` before the PR is opened.

**Version**: 2.0.0 | **Ratified**: 2026-02-19 | **Last Amended**: 2026-02-19
