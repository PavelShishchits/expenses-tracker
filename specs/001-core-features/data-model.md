# Data Model: Core Application Features

**Branch**: `001-core-features` | **Date**: 2026-02-19

## Entities

### User
Represents an authenticated person. Belongs to exactly one Account.

| Field         | Type     | Constraints                          |
|---------------|----------|--------------------------------------|
| id            | cuid     | Primary key                          |
| email         | String   | Unique, lowercase, valid email format |
| passwordHash  | String   | bcrypt/Argon2 hash; never exposed    |
| accountId     | String   | FK → Account; required               |
| createdAt     | DateTime | Auto-set on create                   |
| updatedAt     | DateTime | Auto-updated                         |

**Validation**:
- Email: valid RFC 5322 format, max 254 chars, lowercased before storage
- Password (at input, never stored): min 8 chars

---

### Account
The shared data container. Owns all expenses, categories, and recurring expenses.
Supports 1–2 members.

| Field     | Type     | Constraints                    |
|-----------|----------|--------------------------------|
| id        | cuid     | Primary key                    |
| createdAt | DateTime | Auto-set on create             |
| updatedAt | DateTime | Auto-updated                   |

**Relations**: has many Users (max 2), Categories (custom), Expenses, RecurringExpenses

**Business rule**: A new Account is created for each new registering user. A second user
can join via AccountInvitation.

---

### AccountInvitation
Tracks a pending invitation for a second user to join an Account.

| Field        | Type     | Constraints                                      |
|--------------|----------|--------------------------------------------------|
| id           | cuid     | Primary key                                      |
| accountId    | String   | FK → Account                                     |
| invitedEmail | String   | Email address of the invitee                     |
| token        | String   | Unique, cryptographically random (32 bytes hex)  |
| expiresAt    | DateTime | 7 days from creation                             |
| acceptedAt   | DateTime | Null until accepted; set on acceptance           |
| createdAt    | DateTime | Auto-set on create                               |

**States**: pending (acceptedAt = null, expiresAt > now) → accepted (acceptedAt set)
**Business rules**:
- Only one active (pending + non-expired) invitation per Account at a time
- Cannot invite if Account already has 2 members
- Token is single-use; invalidated on acceptance

---

### Category
An expense classification. Either a system default (shared across all accounts) or a
custom category belonging to a single Account.

| Field     | Type     | Constraints                                  |
|-----------|----------|----------------------------------------------|
| id        | cuid     | Primary key                                  |
| title     | String   | Non-empty, max 50 chars; unique per account scope (see below) |
| icon      | String   | One of the predefined icon identifiers       |
| iconColor | String   | One of the predefined color values (hex)     |
| isSystem  | Boolean  | true for built-in categories                 |
| accountId | String?  | FK → Account; null for system categories     |
| createdAt | DateTime | Auto-set on create                           |

**Uniqueness rule**: title MUST be unique within an account's visible categories (system +
custom combined), case-insensitive.
**System categories** (examples — defined in seed data):
`Food`, `Transport`, `Housing`, `Entertainment`, `Health`, `Shopping`, `Education`, `Other`

**Predefined icon set** (referenced by identifier string):
`shopping-cart`, `utensils`, `car`, `home`, `heart`, `film`, `book`, `briefcase`,
`coffee`, `gift`, `music`, `plane`, `dumbbell`, `wifi`, `phone`, `zap`, `star`, `tag`

**Predefined color palette** (hex values):
`#EF4444`, `#F97316`, `#EAB308`, `#22C55E`, `#14B8A6`, `#3B82F6`, `#8B5CF6`,
`#EC4899`, `#6B7280`, `#78716C`

---

### Expense
A single recorded spending event.

| Field       | Type     | Constraints                                   |
|-------------|----------|-----------------------------------------------|
| id          | cuid     | Primary key                                   |
| amount      | Decimal  | Precision 10, scale 2; must be > 0            |
| date        | DateTime | Date portion only (time stored as UTC midnight); must be ≤ today |
| accountId   | String   | FK → Account                                  |
| categoryId  | String   | FK → Category                                 |
| createdById | String   | FK → User; which member logged the expense    |
| createdAt   | DateTime | Auto-set on create                            |
| updatedAt   | DateTime | Auto-updated                                  |

**Validation**:
- `amount` > 0, max 2 decimal places
- `date` ≤ current date (UTC)
- `categoryId` must reference a category visible to the account (system or account-owned)

---

### RecurringExpense
A monthly expense that repeats automatically until deleted.
Deletion preserves history — past months always reflect the amount that was active.

| Field       | Type     | Constraints                                         |
|-------------|----------|-----------------------------------------------------|
| id          | cuid     | Primary key                                         |
| amount      | Decimal  | Precision 10, scale 2; must be > 0                  |
| label       | String   | Non-empty, max 100 chars; descriptive name          |
| accountId   | String   | FK → Account                                        |
| categoryId  | String   | FK → Category                                       |
| createdById | String   | FK → User                                           |
| activeFrom  | DateTime | First day of the creation month (UTC); inclusive    |
| deletedAt   | DateTime | Null while active; set to first day of deletion month when deleted |
| createdAt   | DateTime | Auto-set on create                                  |

**History logic**: A recurring expense contributes to month M if and only if:
`activeFrom ≤ first-day-of-M` AND (`deletedAt` is null OR `deletedAt > first-day-of-M`)

**Validation**:
- `amount` > 0
- `label` non-empty, max 100 chars

---

## Entity Relationships

```
Account ──< User (1..2 per account)
Account ──< Category (custom only; system categories have accountId = null)
Account ──< Expense
Account ──< RecurringExpense
Account ──< AccountInvitation (0..1 active at a time)

User ──> Account (belongs to)
User ──< Expense (createdBy)
User ──< RecurringExpense (createdBy)

Category ──< Expense
Category ──< RecurringExpense
```

> **Note**: No RefreshToken table. Auth is stateless — JWT tokens are verified by signature only
> and are not persisted server-side. See research.md §3 for the full token architecture.

## State Transitions

### AccountInvitation
```
[created] → pending
pending   → accepted   (invitee accepts; new User created/linked; invitation.acceptedAt set)
pending   → expired    (expiresAt < now; virtual state — no DB update needed)
```

### RecurringExpense
```
[created] → active    (deletedAt = null)
active    → inactive  (deletedAt set to first-day-of-current-month on user delete)
```
Inactive recurring expenses remain in the DB permanently for historical report accuracy.

## Report Aggregation Logic

### Month view (period = month, year, month)
```sql
SELECT
  c.id, c.title, c.icon, c.iconColor,
  SUM(e.amount) AS total
FROM expenses e
JOIN categories c ON e.categoryId = c.id
WHERE e.accountId = :accountId
  AND date_trunc('month', e.date) = :targetMonth
GROUP BY c.id, c.title, c.icon, c.iconColor
UNION ALL
SELECT
  c.id, c.title, c.icon, c.iconColor,
  re.amount AS total
FROM recurring_expenses re
JOIN categories c ON re.categoryId = c.id
WHERE re.accountId = :accountId
  AND re.activeFrom <= :targetMonth
  AND (re.deletedAt IS NULL OR re.deletedAt > :targetMonth)
-- Then aggregate by category in application layer
```

### Year view (period = year, year)
Returns 12 monthly totals (expenses + recurring) aggregated across all categories per month.
