# Tasks: Core Application Features

**Input**: Design documents from `/specs/001-core-features/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks in this group)
- **[Story]**: Which user story this task belongs to (US1–US6)
- All file paths are relative to repo root

---

## Phase 1: Setup

**Purpose**: Initialize pnpm workspace monorepo with all three packages and tooling.

- [X] T001 Initialize pnpm workspace: root `package.json` (scripts: dev, test, build) and `pnpm-workspace.yaml` declaring `backend`, `frontend`, `shared` packages
- [X] T002 [P] Initialize backend package: `backend/package.json` (Fastify 5.7.4, Prisma 5.21.1, @fastify/cookie 11.0.2, @fastify/cors 11.2.0, @fastify/helmet 13.0.2, jose 6.1.3, bcryptjs 3.0.3, Zod 4.3.6) and `backend/tsconfig.json` (strict mode, Node20 target)
- [X] T003 [P] Initialize frontend package: `frontend/package.json` (Next.js 16.1.6, React 19.2.4, Tailwind CSS 4.2.0, Recharts 3.7.0, Zod 4.3.6) and `frontend/tsconfig.json` (strict mode, Next.js extends)
- [X] T004 [P] Initialize shared workspace package: `shared/package.json` (Zod 4.3.6 as peer dep) and `shared/tsconfig.json` (strict mode, composite); create `shared/src/schemas/` directory and `shared/src/index.ts` re-exporting all schemas
- [X] T005 [P] Configure Vitest for backend in `backend/vitest.config.ts` (globals: true, environment: node, coverage reporter); add `test` and `test:coverage` scripts to `backend/package.json`
- [X] T006 [P] Configure Vitest for frontend in `frontend/vitest.config.ts` (jsdom environment, React Testing Library setup) and Playwright in `frontend/playwright.config.ts` (base URL: localhost:3000); add `test`, `test:e2e`, `test:coverage` scripts to `frontend/package.json`

**Checkpoint**: `pnpm install` runs cleanly; all three packages resolve; test commands run (no tests yet, config valid).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 Create Prisma schema with all domain models in `backend/prisma/schema.prisma`: `User` (id cuid, email unique, passwordHash, accountId FK, createdAt, updatedAt), `Account` (id cuid, createdAt, updatedAt), `AccountInvitation` (id, accountId FK, invitedEmail, token unique, expiresAt, acceptedAt nullable, createdAt), `Category` (id, title, icon, iconColor, isSystem, accountId nullable FK, createdAt), `Expense` (id, amount Decimal(10,2), date DateTime, accountId FK, categoryId FK, createdById FK, createdAt, updatedAt), `RecurringExpense` (id, amount Decimal(10,2), label, accountId FK, categoryId FK, createdById FK, activeFrom DateTime, deletedAt nullable DateTime, createdAt). Include all relations, indexes, and `@@map` snake_case table names.
- [X] T008 Generate Prisma client and create initial migration: run `prisma generate` and `prisma migrate dev --name init` to produce `backend/prisma/migrations/` — NOTE: `prisma generate` ✓ done; `prisma migrate dev` requires user to set DATABASE_URL in `backend/.env` first
- [X] T009 Create Prisma seed script for system categories in `backend/prisma/seed.ts`: upsert 8 system categories (`Food/utensils/#EF4444`, `Transport/car/#3B82F6`, `Housing/home/#22C55E`, `Entertainment/film/#8B5CF6`, `Health/heart/#EC4899`, `Shopping/shopping-cart/#F97316`, `Education/book/#EAB308`, `Other/tag/#6B7280`) with `isSystem: true, accountId: null`; add `prisma.seed` entry to `backend/package.json`
- [X] T010 [P] Implement JWT helpers in `backend/src/lib/jwt.ts`: `signAccessToken(payload: JwtPayload)` (HS256, 15m TTL, `JWT_ACCESS_SECRET`), `signRefreshToken(payload)` (HS256, 30d TTL, `JWT_REFRESH_SECRET`), `verifyAccessToken(token)`, `verifyRefreshToken(token)` — all using `jose`; export `JwtPayload` type `{ sub: string; email: string }`
- [X] T011 [P] Implement password helpers in `backend/src/lib/password.ts`: `hashPassword(plain: string): Promise<string>` and `verifyPassword(plain: string, hash: string): Promise<boolean>` using `bcryptjs` (cost factor 12)
- [X] T012 [P] Scaffold Fastify infrastructure plugin files in `backend/src/plugins/`: `cookies.ts` (register `@fastify/cookie`), `cors.ts` (register `@fastify/cors` with `CORS_ORIGIN` env and `credentials: true`), `helmet.ts` (register `@fastify/helmet`)
- [X] T013 Create auth preHandler Fastify plugin in `backend/src/plugins/auth.ts`: `verifyAccessToken` preHandler — reads `access_token` HttpOnly cookie, calls `verifyAccessToken()` from `lib/jwt.ts`, attaches decoded `JwtPayload` to `request.user`; returns `401` on missing or invalid/expired token
- [X] T014 Create Fastify app factory in `backend/src/app.ts` (register all plugins from `src/plugins/`, register all route groups via prefix, add `GET /health` route, add global error serializer) and server entry in `backend/src/server.ts` (calls `app.listen({ port: PORT })`, handles `SIGTERM` with `await prisma.$disconnect()`)
- [X] T015 [P] Create auth Zod schemas in `shared/src/schemas/auth.ts`: `registerSchema` (email: z.string().email(), password: z.string().min(8)), `loginSchema` (email, password); export inferred `RegisterInput` and `LoginInput` types
- [X] T016 [P] Create expense Zod schemas in `shared/src/schemas/expense.ts`: `createExpenseSchema` (amount: positive with ≤2 decimal places, date: ISO date string, categoryId: non-empty string); export `CreateExpenseInput` type
- [X] T017 [P] Create category Zod schemas in `shared/src/schemas/category.ts`: `createCategorySchema` (title: 1–50 chars, icon: non-empty string, iconColor: hex color string); export `CreateCategoryInput` type; export `PREDEFINED_ICONS` (18 identifiers) and `PREDEFINED_COLORS` (10 hex values) as const arrays
- [X] T018 [P] Create recurring expense Zod schemas in `shared/src/schemas/recurring.ts`: `createRecurringSchema` (amount: positive, label: 1–100 chars, categoryId: non-empty string); export `CreateRecurringInput` type
- [X] T019 [P] Create account Zod schemas in `shared/src/schemas/account.ts`: `inviteSchema` (email: valid email), `acceptInviteSchema` (token: non-empty string); export `InviteInput` and `AcceptInviteInput` types
- [X] T020 Create typed fetch API client in `frontend/src/services/api.ts`: `apiFetch(path, options)` sets `credentials: 'include'` and base URL from `NEXT_PUBLIC_API_URL`; implements 401 auto-refresh queue (single in-flight `POST /auth/refresh`, pending requests retry on success; redirect to `/login` on refresh failure)
- [X] T021 Create Next.js middleware for route protection in `frontend/src/middleware.ts`: redirect unauthenticated requests for `/(app)` paths to `/login`; redirect authenticated requests to `/login` and `/register` away to `/` — use `access_token` cookie presence as the auth signal
- [X] T022 [P] Create layout shells: protected app layout in `frontend/src/app/(app)/layout.tsx` (wraps children with auth context provider, navigation placeholder) and unauthenticated auth layout in `frontend/src/app/(auth)/layout.tsx` (centered card wrapper)

**Checkpoint**: `pnpm --filter backend exec prisma migrate dev` runs; seed populates system categories; Fastify starts on port 4000 (`GET /health → 200`); Next.js starts on port 3000.

---

## Phase 3: User Story 1 — User Authentication (Priority: P1) 🎯 MVP start

**Goal**: Users can register, log in, and log out. Unauthenticated access to protected pages redirects to login.

**Independent Test**: Register via `POST /auth/register`, log in, verify HttpOnly cookies set. Open browser to `/`, verify redirect to `/login`. Log in via UI, verify redirect to `/`. Log out, verify redirect to `/login`. Call `POST /auth/refresh` — verify new tokens issued without DB lookup.

- [X] T023 [US1] Implement AuthService in `backend/src/services/auth.service.ts`: `register(input: RegisterInput)` (check email uniqueness → 409, hash password, create Account + User in Prisma transaction, return user without passwordHash), `login(input: LoginInput)` (find user by email, verify password → throw 401 on mismatch, return user)
- [X] T024 [P] [US1] Implement `POST /auth/register` route in `backend/src/routes/auth/register.ts`: validate body with `registerSchema`, call `AuthService.register`, issue access + refresh tokens via `signAccessToken`/`signRefreshToken`, set both as HttpOnly + Secure + SameSite=Strict cookies, return `201 { user }`
- [X] T025 [P] [US1] Implement `POST /auth/login` route in `backend/src/routes/auth/login.ts`: validate body with `loginSchema`, call `AuthService.login`, set access + refresh cookies, return `200 { user }`
- [X] T026 [P] [US1] Implement `POST /auth/logout` route in `backend/src/routes/auth/logout.ts`: apply `verifyAccessToken` preHandler; clear `access_token` and `refresh_token` cookies via `Max-Age=0`; return `204`
- [X] T027 [P] [US1] Implement `POST /auth/refresh` route in `backend/src/routes/auth/refresh.ts`: read `refresh_token` cookie; call `verifyRefreshToken()` (signature + expiry only — no DB); issue new access + refresh token pair as HttpOnly cookies; return `200`; return `401` on missing, expired, or invalid token
- [X] T028 [US1] Register all auth routes under `/auth` prefix in `backend/src/routes/auth/index.ts`; import and register in `backend/src/app.ts`
- [X] T029 [US1] Create auth API service in `frontend/src/services/auth.service.ts`: `register(input)`, `login(input)`, `logout()`, `refresh()` — all using `apiFetch`; export `AuthUser` type `{ id: string; email: string; createdAt: string }`
- [X] T030 [US1] Create `useAuth` hook in `frontend/src/hooks/useAuth.ts`: `user` state, `login(input)`, `register(input)`, `logout()` actions; calls auth service; on mount verifies session via `GET /auth/me` or `POST /auth/refresh`; exposes `isLoading` flag
- [X] T031 [P] [US1] Create login page in `frontend/src/app/(auth)/login/page.tsx`: email + password form; calls `useAuth.login`; shows field-level validation errors; redirects to `/` on success; link to `/register`
- [X] T032 [P] [US1] Create register page in `frontend/src/app/(auth)/register/page.tsx`: email + password form; calls `useAuth.register`; shows validation errors; redirects to `/` on success; link to `/login`

**Checkpoint**: US1 fully functional. Register a new user, log in, land on main page (empty), log out, verify redirect to login. Token refresh works stateless.

---

## Phase 4: User Story 2 — Log an Expense (Priority: P1)

**Goal**: Logged-in users can select a category and save an expense with amount and date.

**Independent Test**: Log in → main page shows category grid with system categories → select "Food" → enter 12.50, today's date → save → expense persisted. Try future date → prevented. Try amount 0 → validation error. No categories → prompt shown.

- [ ] T033 [P] [US2] Implement `CategoryService.list(accountId)` in `backend/src/services/category.service.ts`: return all system categories (`isSystem: true`) plus account's custom categories (`accountId = given`), sorted by title
- [ ] T034 [P] [US2] Implement `ExpenseService` in `backend/src/services/expense.service.ts`: `create(accountId, userId, input: CreateExpenseInput)` (validate `date ≤ today UTC`, create Expense with category relation, return with category + createdBy), `list(accountId, from?, to?)` (return expenses with category + createdBy, filtered by date range if provided)
- [ ] T035 [US2] Implement `GET /categories` route in `backend/src/routes/categories/index.ts`: apply `verifyAccessToken` preHandler; call `CategoryService.list(request.user.accountId)`; return `200 { categories }`; register under `/categories` in `app.ts`
- [ ] T036 [US2] Implement `GET /expenses` and `POST /expenses` routes in `backend/src/routes/expenses/index.ts`: both apply `verifyAccessToken`; GET calls `ExpenseService.list` with optional `from`/`to` query params; POST validates body with `createExpenseSchema`, calls `ExpenseService.create`, returns `201`
- [ ] T037 [US2] Implement `DELETE /expenses/:id` route in `backend/src/routes/expenses/[id].ts`: apply `verifyAccessToken`; verify expense `accountId` matches `request.user.accountId` → `403`; delete; return `204`; `404` if not found; register expense routes in `app.ts`
- [ ] T038 [P] [US2] Create `CategoryGrid` component in `frontend/src/components/CategoryGrid.tsx`: renders grid of category tiles (icon rendered via icon identifier, colored circle background, title below); `categories` prop + `onSelect(category)` callback; highlights selected tile
- [ ] T039 [P] [US2] Create `ExpenseForm` component in `frontend/src/components/ExpenseForm.tsx`: amount input (positive, 2 decimal places), date input (type="date", max=today, defaults to today), save + cancel buttons; calls `onSubmit({ amount, date })` prop; shows inline validation errors
- [ ] T040 [US2] Create main page in `frontend/src/app/(app)/page.tsx`: fetches categories on mount; renders `CategoryGrid`; on category select shows `ExpenseForm` (bottom sheet or modal); on submit calls expense service create and resets state; shows "Create a category first" prompt if category list is empty
- [ ] T041 [US2] Create expense API service in `frontend/src/services/expense.service.ts`: `list(from?, to?)`, `create(input)`, `remove(id)` using `apiFetch`
- [ ] T042 [US2] Create category API service in `frontend/src/services/category.service.ts`: `list()` using `apiFetch`
- [ ] T043 [US2] Provide auth context in protected app layout in `frontend/src/app/(app)/layout.tsx`: integrate `useAuth` hook; pass `user` via React context; show loading state on initial session check

**Checkpoint**: US2 fully functional. Log in, see system categories, log an expense, verify via `GET /expenses`.

---

## Phase 5: User Story 3 — Manage Expense Categories (Priority: P2)

**Goal**: Users can view all categories and create custom ones with a chosen icon and color.

**Independent Test**: Categories page shows 8 system defaults. Create "Gym" (dumbbell icon, green). Verify it appears in list and main page grid. Try duplicate title "Gym" → 409 error. Verify system categories have no delete button.

- [ ] T044 [P] [US3] Extend `CategoryService` in `backend/src/services/category.service.ts` with `create(accountId, input: CreateCategoryInput)` (case-insensitive uniqueness check across system + account categories → `409`, then create and return) and `remove(accountId, categoryId)` (verify `isSystem: false` and `accountId` matches → `403`, else delete)
- [ ] T045 [US3] Implement `POST /categories` route in `backend/src/routes/categories/index.ts` (extend existing file): apply `verifyAccessToken`; validate body with `createCategorySchema`; call `CategoryService.create`; return `201`; return `409` on duplicate title
- [ ] T046 [US3] Implement `DELETE /categories/:id` route in `backend/src/routes/categories/[id].ts`: apply `verifyAccessToken`; call `CategoryService.remove`; return `204`; return `403` on system category or wrong account; `404` if not found
- [ ] T047 [P] [US3] Create `IconPicker` component in `frontend/src/components/IconPicker.tsx`: renders scrollable grid of all 18 icons from `PREDEFINED_ICONS` (use Lucide React icons matching each identifier); `value` + `onChange` props; highlights selected; visually shows icon with its color
- [ ] T048 [P] [US3] Create `ColorPicker` component in `frontend/src/components/ColorPicker.tsx`: renders row of 10 color swatches from `PREDEFINED_COLORS`; `value` + `onChange` props; highlights selected with a ring; shows checkmark on selected
- [ ] T049 [US3] Create `CategoryForm` component in `frontend/src/components/CategoryForm.tsx`: title text input (1–50 chars) + `IconPicker` + `ColorPicker`; submit button; calls `onSubmit(input)` prop; shows server error (e.g. "Title already taken")
- [ ] T050 [US3] Create categories page in `frontend/src/app/(app)/categories/page.tsx`: fetches and renders all categories (system first, then custom); custom categories show a delete button with confirmation; renders `CategoryForm` inline or in a sheet; calls category service create/remove; refetches on change
- [ ] T051 [US3] Extend category API service in `frontend/src/services/category.service.ts` with `create(input)` and `remove(id)` methods

**Checkpoint**: US3 fully functional. Create custom category, verify in list and main page. System categories undeletable.

---

## Phase 6: User Story 4 — Spending Reports (Priority: P2)

**Goal**: Users see spending by category for a selected month or year as a horizontal bar chart.

**Independent Test**: Log expenses across 3 categories. Reports page loads current-month chart with correct totals. Select past empty month → empty state shown. Select year → 12-bar chart rendered. All via dropdown navigation.

- [ ] T052 [P] [US4] Implement `ReportService.getMonth(accountId, year, month)` in `backend/src/services/report.service.ts`: sum `Expense.amount` grouped by category for the target month; return `{ period: { type: 'month', year, month }, data: CategoryTotal[], total }` where `CategoryTotal = { categoryId, categoryTitle, icon, iconColor, total: number }`
- [ ] T053 [P] [US4] Implement `ReportService.getYear(accountId, year)` in `backend/src/services/report.service.ts`: for each of 12 months sum all expense amounts; return `{ period: { type: 'year', year }, data: MonthTotal[], total }` where `MonthTotal = { month: 1-12, label: 'Jan'|..., total: number }`
- [ ] T054 [US4] Implement `GET /reports/month` route in `backend/src/routes/reports/month.ts`: apply `verifyAccessToken`; parse `year` and `month` query params (default: current month/year); validate ranges; call `ReportService.getMonth`; return `200` per OpenAPI schema
- [ ] T055 [US4] Implement `GET /reports/year` route in `backend/src/routes/reports/year.ts`: apply `verifyAccessToken`; parse `year` query param (default: current year); call `ReportService.getYear`; return `200` per OpenAPI schema
- [ ] T056 [US4] Register report routes under `/reports` in `backend/src/routes/reports/index.ts`; import and register in `backend/src/app.ts`
- [ ] T057 [P] [US4] Create `PeriodSelector` component in `frontend/src/components/PeriodSelector.tsx`: two-mode dropdown — month mode (month name + year) and year mode; navigates backwards via prev/next arrows or dropdown; emits `onChange({ type, year, month? })`; defaults to current month
- [ ] T058 [P] [US4] Create `MonthReport` component in `frontend/src/components/MonthReport.tsx`: Recharts `<BarChart layout="vertical">` with horizontal bars; Y-axis shows category icon + title; X-axis shows amounts; bar fill = category `iconColor`; shows total; shows empty state message when `data` is empty
- [ ] T059 [P] [US4] Create `YearReport` component in `frontend/src/components/YearReport.tsx`: Recharts `<BarChart>` with 12 vertical bars; X-axis = month abbreviations; shows grand total; shows empty state when all totals are zero
- [ ] T060 [US4] Create reports page in `frontend/src/app/(app)/reports/page.tsx`: renders `PeriodSelector`; fetches from report service on period change; renders `MonthReport` or `YearReport` based on period type; shows `LoadingSkeleton` during fetch
- [ ] T061 [US4] Create reports API service in `frontend/src/services/report.service.ts`: `getMonth(year, month)` and `getYear(year)` using `apiFetch`

**Checkpoint**: US4 fully functional. Log expenses, view horizontal bar chart by category, change to year view, verify 12-bar chart.

---

## Phase 7: User Story 5 — Recurring Expenses (Priority: P3)

**Goal**: Monthly recurring expenses auto-appear in reports; deleted ones remain in historical reports.

**Independent Test**: Create recurring "Netflix 9.99" (Entertainment). View current-month report — Entertainment total increases by 9.99. Soft-delete it. View same month — total still includes 9.99. Verify `deletedAt` is set to first of current month.

- [ ] T062 [P] [US5] Implement `RecurringService.list(accountId)` and `RecurringService.create(accountId, userId, input)` in `backend/src/services/recurring.service.ts`: `create` sets `activeFrom` to first day of current month UTC; `list` returns all (including soft-deleted) for account with category data
- [ ] T063 [US5] Implement `RecurringService.softDelete(accountId, id)` in `backend/src/services/recurring.service.ts`: verify `accountId` matches → `403`; set `deletedAt` to first day of current month UTC; `404` if not found
- [ ] T064 [US5] Extend `ReportService` in `backend/src/services/report.service.ts` to include recurring expenses: in `getMonth`, add recurring amounts for each recurring where `activeFrom ≤ target-month-start AND (deletedAt IS NULL OR deletedAt > target-month-start)`. Apply same per-month filter in `getYear`.
- [ ] T065 [US5] Implement `GET /recurring` and `POST /recurring` routes in `backend/src/routes/recurring/index.ts`: both apply `verifyAccessToken`; POST validates with `createRecurringSchema`; register under `/recurring` in `app.ts`
- [ ] T066 [US5] Implement `DELETE /recurring/:id` route in `backend/src/routes/recurring/[id].ts`: apply `verifyAccessToken`; call `RecurringService.softDelete`; return `204`
- [ ] T067 [P] [US5] Create `RecurringExpenseForm` component in `frontend/src/components/RecurringExpenseForm.tsx`: category dropdown (from account categories), amount input, label text input; submit calls `onSubmit(input)` prop; shows validation errors
- [ ] T068 [P] [US5] Create `RecurringExpenseList` component in `frontend/src/components/RecurringExpenseList.tsx`: lists recurring expenses showing label, category (icon + color + title), amount, active-from date; delete button with confirmation on active entries; "inactive" badge on soft-deleted entries; warning badge if category was deleted
- [ ] T069 [US5] Create recurring expenses page in `frontend/src/app/(app)/recurring/page.tsx`: fetches list, renders `RecurringExpenseList` + `RecurringExpenseForm`; handles create and soft-delete via recurring service; refetches on change
- [ ] T070 [US5] Create recurring API service in `frontend/src/services/recurring.service.ts`: `list()`, `create(input)`, `remove(id)` using `apiFetch`

**Checkpoint**: US5 fully functional. Create recurring expense, verify it adds to month report total. Delete it, verify history preserved.

---

## Phase 8: User Story 6 — Shared Account (Priority: P3)

**Goal**: An account owner can invite one other user; both see all shared expenses, categories, and reports.

**Independent Test**: User A invites User B by email → B receives token → B accepts → B logs in → B sees A's expenses in reports. Either user removes the other → removed user loses access and gets a new solo account.

- [ ] T071 [P] [US6] Implement `AccountService.get(accountId)` in `backend/src/services/account.service.ts`: return members (id, email, createdAt as joinedAt) and active pending invitation (invitedEmail, expiresAt) where `acceptedAt IS NULL AND expiresAt > now`
- [ ] T072 [P] [US6] Implement `AccountService.invite(accountId, invitedEmail)` in `backend/src/services/account.service.ts`: validate account has < 2 members and no active pending invitation → `400`; create `AccountInvitation` with `crypto.randomBytes(32).toString('hex')` token and `expiresAt = now + 7 days`; return token (no email sending in v1 — caller logs or returns token for manual sharing)
- [ ] T073 [US6] Implement `AccountService.acceptInvite(userId, token)` in `backend/src/services/account.service.ts`: find invitation by token; validate not expired and `acceptedAt IS NULL`; validate target account has room; in Prisma transaction: set `acceptedAt = now`, update `user.accountId` to the invitation's `accountId`; return updated account
- [ ] T074 [US6] Implement `AccountService.removeMember(requestingUserId, targetUserId, accountId)` in `backend/src/services/account.service.ts`: validate both are members; in Prisma transaction: create new solo `Account` for removed user, update their `accountId`; historical shared data stays on original account; return `204`
- [ ] T075 [US6] Implement `GET /account` route in `backend/src/routes/accounts/index.ts`: apply `verifyAccessToken`; call `AccountService.get(request.user.accountId)`; return `200` per OpenAPI schema
- [ ] T076 [US6] Implement `POST /account/invite` route in `backend/src/routes/accounts/invite.ts`: apply `verifyAccessToken`; validate with `inviteSchema`; call `AccountService.invite`; return `201 { message, token }` (token included for v1 manual sharing; remove before production); `400` if full or pending invite exists
- [ ] T077 [US6] Implement `POST /account/invite/accept` route in `backend/src/routes/accounts/accept.ts`: apply `verifyAccessToken`; validate with `acceptInviteSchema`; call `AccountService.acceptInvite`; return `200` with account data; `400` on invalid/expired token
- [ ] T078 [US6] Implement `DELETE /account/members/:userId` route in `backend/src/routes/accounts/members.ts`: apply `verifyAccessToken`; call `AccountService.removeMember`; return `204`; `400` if user is not a member; register all account routes under `/account` in `app.ts`
- [ ] T079 [P] [US6] Create `InviteMemberForm` component in `frontend/src/components/InviteMemberForm.tsx`: email input + "Send Invite" button; shows pending invitation status (email + expiry) if one exists; disables form when account has 2 members; calls `onInvite(email)` prop
- [ ] T080 [P] [US6] Create `MemberList` component in `frontend/src/components/MemberList.tsx`: lists account members (email + join date); shows "Remove" button for the other member only (not yourself); calls `onRemove(userId)` with confirmation; shows "You" badge on current user
- [ ] T081 [US6] Create account page in `frontend/src/app/(app)/account/page.tsx`: fetches account data; renders `MemberList` + `InviteMemberForm` (hidden when 2 members); handles invite and remove via account service; shows success/error feedback
- [ ] T082 [US6] Create account API service in `frontend/src/services/account.service.ts`: `get()`, `invite(email)`, `acceptInvite(token)`, `removeMember(userId)` using `apiFetch`

**Checkpoint**: US6 fully functional. Invite flow works with token. Both members see shared data in reports. Remove member works.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: PWA manifest, deployment config, navigation, error UX, and final validation.

- [ ] T083 [P] Create Web App Manifest in `frontend/src/app/manifest.ts`: export `MetadataRoute.Manifest` with `name: 'Expenses Tracker'`, `short_name: 'Expenses'`, `start_url: '/'`, `display: 'standalone'`, `background_color: '#ffffff'`, `theme_color: '#3B82F6'`, `icons: [192×192, 512×512]`
- [ ] T084 [P] Add placeholder app icon files to `frontend/public/`: `icon-192x192.png` and `icon-512x512.png` (placeholder PNGs at correct dimensions; replace with final assets before production deployment)
- [ ] T085 [P] Create `backend/Dockerfile`: multi-stage build (base: node:20-alpine); copy source + prisma schema; run `npm ci --only=production`; run `prisma generate`; compile TypeScript to `dist/`; expose port 4000; CMD runs `prisma migrate deploy` then starts server
- [ ] T086 [P] Create `backend/fly.toml`: app name, primary region, `internal_port = 4000`, health check `GET /health`, `auto_stop_machines = false` (always-on for free tier)
- [ ] T087 Create GitHub Actions CI workflow in `.github/workflows/ci.yml`: on push + PR — `pnpm install`, type-check all workspaces (`tsc --noEmit`), lint, `pnpm --filter backend test`, `pnpm --filter frontend test`; cache `.pnpm-store`
- [ ] T088 [P] Create `Navigation` component in `frontend/src/components/Navigation.tsx`: bottom tab bar on mobile, sidebar on desktop; links to Main (`/`), Reports (`/reports`), Categories (`/categories`), Recurring (`/recurring`), Account (`/account`); active route highlighted; integrate into `frontend/src/app/(app)/layout.tsx`
- [ ] T089 [P] Add error boundary and not-found pages: `frontend/src/app/error.tsx` (client component with retry button), `frontend/src/app/not-found.tsx` (404 page with link home)
- [ ] T090 [P] Create `LoadingSkeleton` component in `frontend/src/components/LoadingSkeleton.tsx`: pulse animation variants: `category-grid` (grid of grey tiles), `chart` (horizontal bars), `list` (stacked rows); use in reports, categories, and recurring pages during fetch
- [ ] T091 Run quickstart.md happy path: register → login → log expense → check reports chart → verify manifest at `/.well-known/manifest.json` → verify `GET /health → 200`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **blocks all user stories**
- **Phase 3 (US1)**: Depends on Phase 2 only
- **Phase 4 (US2)**: Depends on Phase 2 only — can run parallel to Phase 3
- **Phase 5 (US3)**: Depends on Phase 2; extends T033 (CategoryService) — begin after T033
- **Phase 6 (US4)**: Depends on Phase 2 only — can run parallel to Phase 3, 4, 5
- **Phase 7 (US5)**: Depends on Phase 6 — T064 extends the ReportService built in Phase 6
- **Phase 8 (US6)**: Depends on Phase 2 only — can run parallel to Phase 3–6
- **Final Phase**: Depends on all desired user stories complete

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|-----------|----------------------|
| US1 (P1) | Phase 2 | US2, US4, US6 |
| US2 (P1) | Phase 2 | US1, US4, US6 |
| US3 (P2) | Phase 2 + T033 | US1, US4, US6 |
| US4 (P2) | Phase 2 | US1, US2, US3, US6 |
| US5 (P3) | US4 (ReportService) | US6 |
| US6 (P3) | Phase 2 | US1, US2, US3, US4 |

### Parallel Opportunities

```
Phase 1:  T002, T003, T004, T005, T006 → all parallel after T001
Phase 2:  T010, T011, T012 → parallel (JWT, password, plugins)
          T015, T016, T017, T018, T019 → parallel (all Zod schemas)
          T021, T022 → parallel (middleware + layout shells)
US1:      T024, T025, T026, T027 → parallel (4 route files) after T023
          T031, T032 → parallel (login/register pages) after T030
US2:      T033, T034 → parallel (CategoryService + ExpenseService)
          T038, T039 → parallel (CategoryGrid + ExpenseForm)
US3:      T044 → parallel with T047, T048 (service + UI pickers)
US4:      T052, T053 → parallel (getMonth + getYear)
          T057, T058, T059 → parallel (PeriodSelector + MonthReport + YearReport)
US5:      T062 → parallel with T067, T068 (service + UI components)
US6:      T071, T072 → parallel (AccountService.get + invite)
          T079, T080 → parallel (InviteMemberForm + MemberList)
Polish:   T083–T090 → all parallel
```

---

## Implementation Strategy

### MVP (US1 + US2 — 43 tasks through Phase 4)

1. Complete Phase 1: Setup (T001–T006)
2. Complete Phase 2: Foundational (T007–T022)
3. Complete Phase 3: US1 Authentication (T023–T032) — **STOP + VALIDATE**
4. Complete Phase 4: US2 Log Expense (T033–T043) — **STOP + VALIDATE**
5. Deploy: working single-user expense tracker

### Incremental Delivery

| Stage | Phases | Delivers |
|-------|--------|---------|
| MVP | 1–4 | Register, login, log expenses |
| + Categories | + Phase 5 | Custom category management |
| + Reports | + Phase 6 | Spending insight charts |
| + Recurring | + Phase 7 | Auto-monthly expenses |
| + Sharing | + Phase 8 | Household tracking |
| Production | + Final | PWA, CI/CD, Fly.io deploy |

---

## Notes

- Auth is stateless: no `RefreshToken` DB table; `POST /auth/refresh` verifies JWT signature only
- `COOKIE_SECRET` env var is NOT required (removed in constitution v2.0.0)
- All [P] tasks touch different files with no intra-group runtime dependencies
- Each phase checkpoint should be verified before advancing to the next phase
- Run `pnpm --filter backend exec prisma migrate dev` after any schema changes to `schema.prisma`
- Commit after each phase checkpoint; use branch strategy aligned to user stories
