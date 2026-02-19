# Research: Core Application Features

**Branch**: `001-core-features` | **Date**: 2026-02-19

## 1. Chart Library

**Decision**: Recharts 3.7.0 (`recharts@3.7.0`)

**Rationale**:
- Horizontal bar charts via `<BarChart layout="vertical">` — exactly what the spec requires
- ~60 KB gzipped; lightest full-featured option for a PWA
- First-class TypeScript support; types included in the package
- Works seamlessly with Next.js 15 App Router as a `'use client'` component
- Actively maintained; regular releases through 2025
- Declarative, composable API — minimal boilerplate for a single chart type

**Alternatives considered**:
- Chart.js + react-chartjs-2: Larger setup overhead, more imperative API; rejected
- Victory: Heavier bundle (~80–100 KB gzipped); slower release cycle; rejected
- Tremor: Limited horizontal bar support; more opinionated styling; rejected
- shadcn/ui charts: Wraps Recharts anyway — no benefit over direct Recharts use here

---

## 2. PWA — Manifest Only (v1)

**Decision**: Native Next.js `app/manifest.ts` — no external library

**Rationale**:
- Next.js 16 App Router has built-in support for Web App Manifest via a `app/manifest.ts` file
  that exports a `MetadataRoute.Manifest` object (ref: nextjs.org/docs/app/guides/progressive-web-apps)
- No `@ducanh2912/next-pwa`, no Serwist, no service worker in v1
- Installability requires only: a valid manifest + HTTPS — both are met with this approach
- Service worker, offline caching, background sync, and push notifications are explicitly
  deferred to a future iteration

**Implementation** (zero dependencies):
```ts
// frontend/src/app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Expenses Tracker',
    short_name: 'Expenses',
    description: 'Track and analyse your spending',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3B82F6',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
```

App icons (192×192 and 512×512 PNG) are placed in `frontend/public/`.

**When to add offline/service worker**: Use Serwist (recommended by Next.js docs for App Router)
when offline caching is prioritised. Note: Serwist currently requires webpack configuration.

**Alternatives considered**:
- `@ducanh2912/next-pwa@10.2.9`: Full-featured but unnecessary complexity for manifest-only scope
- `@serwist/next@9.5.4`: Best option for future offline support; deferred
- Custom `public/sw.js`: Maximum control; deferred with Serwist

---

## 3. JWT Authentication Pattern (Fastify) — Stateless

**Decision**: `jose@6.1.3` + Fastify plugin + HttpOnly cookie storage (signature-only, no DB)

**Rationale**:
- `jose` is zero-dependency, standards-compliant (RFC 7515/7519), works in Node.js and edge
- Lighter and more modern than `@fastify/jwt` (which wraps the legacy `jsonwebtoken`)
- Fastify plugin pattern with `preHandler` hook is the idiomatic approach for route auth
- Stateless design: no DB table, no token storage, no reuse detection — satisfies constitution
  Principle II v2.0.0; eliminates the RefreshToken table entirely (simpler than stateful design)

**Key patterns**:

### Token architecture
- Access token: HS256, ≤15 min TTL, stored in `access_token` HttpOnly + Secure + SameSite=Strict cookie
- Refresh token: HS256, 30d TTL, stored in `refresh_token` HttpOnly + Secure + SameSite=Strict cookie
- Both tokens verified by cryptographic signature only — no server-side state required
- Two separate signing secrets: `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`

### Auth flow
1. **Login / Register**: issue both tokens as HttpOnly cookies; return `{ user }` in body
2. **Authenticated request**: Fastify `preHandler` reads `access_token` cookie →
   `jose.jwtVerify(token, accessSecret)` → attach decoded payload to `request.user`
3. **Token refresh** (`POST /auth/refresh`): read `refresh_token` cookie →
   `jose.jwtVerify(token, refreshSecret)` → issue new access + refresh token pair; update cookies
4. **Logout** (`POST /auth/logout`): clear both cookies via `Set-Cookie: ...; Max-Age=0`;
   no DB cleanup needed — stateless logout is immediate on the client

### Logout security note
An access token remains cryptographically valid for up to its TTL (≤15 min) after logout.
This is the accepted trade-off for stateless auth. The short TTL bounds the exposure window.
Multi-device session revocation is out of scope for v1 (see spec.md Assumptions).

### Next.js frontend token refresh
- All API calls use `credentials: 'include'` (cookies sent automatically)
- On 401: pause in-flight requests, call `POST /auth/refresh`, retry; if refresh fails → redirect to login
- Request queue pattern prevents multiple simultaneous refresh calls

---

## 4. Neon + Prisma (Node.js long-running process)

**Decision**: Standard Prisma PostgreSQL adapter; Neon pooled connection string

**Rationale**:
- `@prisma/adapter-neon` is designed for serverless/edge functions; NOT needed for a
  long-running Fastify process on Fly.io
- Standard adapter is simpler and more efficient for persistent connections

**Key configuration**:

```
# .env
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require&connection_limit=5"
```

- `sslmode=require` is mandatory for Neon
- `connection_limit=5` for Fly.io free tier (limited memory); raise to 10+ on paid tiers
- Use Neon's **pooled** endpoint (default hostname, port 5432) — NOT the unpooled port 6543
- Neon closes idle connections after ~15 minutes; Prisma reconnects automatically

**Prisma datasource**:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Gotchas**:
- Neon uses PgBouncer for pooling; Prisma handles this transparently
- Always `await prisma.$disconnect()` on `SIGTERM` for clean Fly.io redeployments
- Prisma 6 has no special Neon configuration — standard setup works out of the box
