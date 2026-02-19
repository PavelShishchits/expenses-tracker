# Feature Specification: Core Application Features

**Feature Branch**: `001-core-features`
**Created**: 2026-02-19
**Status**: Draft
**Input**: User description: "Main functionality of this app should be: authentication by login and
password at first (maybe later we would add some apple id or google auth). After login user redirect
to main page. Where are expenses categories are listed. User can pick category and enter amount of
money. It should be possible to choose date of spending (by default it is today's date). Also there
should be report page, where user can see it's all spendings based on categories it could be rendered
as a line, horizontal graph. And user should be able to check it spendings in previous months and
years (via dropdown). Also app should have categories page, where all categories are listed with
possibility to add custom categories. Category should contain icon (from predefined list), icon color
(predefined list) and title. Also I as a user I want to be able to define some spendings that are
happening from month to month (for example subscriptions). Also I want possibility to share account
between two persons. Recurring expenses that got deleted should still appear in history."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Authentication (Priority: P1)

A new user can register for an account using their email and password. An existing user can log in
and is taken directly to the main screen. Unauthenticated users who attempt to access any protected
page are redirected to the login screen. A logged-in user can log out at any time.

**Why this priority**: Authentication is the entry point for all other features. No other user story
is accessible without it.

**Independent Test**: Can be fully tested by registering a new account, logging in, verifying the
user lands on the main page, and verifying that navigating directly to the main page URL without a
session redirects to login. Delivers: isolated, secure user accounts.

**Acceptance Scenarios**:

1. **Given** a visitor on the login page, **When** they enter a valid email and password and submit,
   **Then** they are redirected to the main page.
2. **Given** a visitor on the login page, **When** they enter an incorrect password, **Then** they
   see a descriptive error message and remain on the login page.
3. **Given** a new user on the registration page, **When** they provide a valid email and password
   and submit, **Then** their account is created and they are redirected to the main page.
4. **Given** an unauthenticated user who navigates directly to a protected page, **When** the page
   loads, **Then** they are redirected to the login page.
5. **Given** a logged-in user, **When** they log out, **Then** their session cookies are cleared
   client-side and they are redirected to the login page. No server-side invalidation is required;
   previously issued access tokens remain valid until their TTL expires (≤15 min window).

---

### User Story 2 - Log an Expense (Priority: P1)

A logged-in user opens the app to the main page, which shows all expense categories available to
their account. They select a category, enter a positive amount, optionally adjust the date (which
defaults to today), and save the expense. The expense is persisted to the shared account.

**Why this priority**: Expense logging is the single most frequent action in the app — the reason
users open it daily.

**Independent Test**: Can be fully tested by logging in, selecting a category, entering an amount
and date, saving, and verifying the expense appears in the reports page for that date and category.
Delivers: the core value of the application.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the main page, **When** they select a category, enter a valid
   amount, and save, **Then** the expense is recorded with today's date.
2. **Given** a logged-in user entering an expense, **When** they change the date to a past date and
   save, **Then** the expense is recorded with the selected date.
3. **Given** a logged-in user entering an expense, **When** they attempt to select a future date,
   **Then** the date picker prevents selection of dates beyond today.
4. **Given** a logged-in user entering an expense, **When** they submit with a zero or negative
   amount, **Then** they see a validation error and the expense is not saved.
5. **Given** a logged-in user on the main page with no categories available, **When** they view the
   page, **Then** they see a prompt directing them to create a category first.

---

### User Story 3 - Manage Expense Categories (Priority: P2)

A logged-in user navigates to the categories page, where they see all system-default categories and
any custom categories created within their account. They can add a new custom category by choosing a
title, an icon from a predefined set, and an icon color from a predefined set. Custom categories are
visible to all members of the shared account.

**Why this priority**: System-default categories unblock expense logging (P1). Custom categories are
important personalisation but not required for the core workflow.

**Independent Test**: Can be fully tested by navigating to the categories page, creating a new
category with a unique title, icon, and color, and confirming it appears in the list and is
selectable on the main screen. Delivers: a personalised expense taxonomy.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the categories page, **When** the page loads, **Then** they see all
   system-default categories and all custom categories belonging to their account.
2. **Given** a logged-in user creating a category, **When** they provide a title, select an icon,
   select a color, and save, **Then** the new category appears in the list and is available for
   expense logging.
3. **Given** a logged-in user creating a category, **When** they submit without a title, **Then**
   they see a validation error.
4. **Given** a logged-in user creating a category, **When** they enter a title that already exists
   in the account's category list, **Then** they see an error indicating the name is already taken.

---

### User Story 4 - Spending Reports (Priority: P2)

A logged-in user navigates to the reports page and sees the account's combined spending for the
current month visualised as a horizontal bar chart grouped by category. They can use a dropdown to
navigate to previous months or previous years (where spending is aggregated by month for the
selected year).

**Why this priority**: Reports are the key insight feature of the app — they let users understand
where their money goes over time, including combined spending from both account members.

**Independent Test**: Can be fully tested by logging several expenses across different categories and
dates, viewing the reports page, confirming the chart is accurate, and filtering to a past period.
Delivers: actionable spending insight.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the reports page, **When** the page loads, **Then** they see the
   account's expenses for the current month grouped by category as a horizontal bar chart.
2. **Given** a logged-in user on the reports page, **When** they select a past month from the period
   dropdown, **Then** the chart updates to show expenses for that month only.
3. **Given** a logged-in user on the reports page, **When** they select a past year from the period
   dropdown, **Then** the chart shows monthly spending aggregates for the full selected year.
4. **Given** a logged-in user with no expenses in the selected period, **When** that period is
   chosen, **Then** an empty state message is shown instead of a chart.

---

### User Story 5 - Recurring Expenses (Priority: P3)

A logged-in user can define a recurring monthly expense (e.g., a subscription) by specifying a
category, amount, and a descriptive label. Recurring expenses are automatically reflected in each
month's report totals from their creation month onwards. Deleting a recurring expense removes it
from future months only — it continues to appear in historical reports for every month it was active.

**Why this priority**: Useful for tracking predictable monthly costs, but all higher-priority flows
function fully without it.

**Independent Test**: Can be fully tested by creating a recurring expense, verifying it appears in
the current month's report, deleting it, and verifying it still appears in past months' reports but
not in future months. Delivers: automatic tracking of fixed monthly costs with accurate history.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they create a recurring expense with a valid category,
   amount, and label, **Then** it is saved and appears in their list of recurring expenses.
2. **Given** a logged-in user with a recurring expense, **When** they view the report for the
   current or any future month, **Then** the recurring expense amount is included in the total for
   its category.
3. **Given** a logged-in user who deletes a recurring expense, **When** the deletion is confirmed,
   **Then** it no longer appears in future months' reports.
4. **Given** a logged-in user who deleted a recurring expense, **When** they view a historical
   report for a month when the expense was active, **Then** the recurring expense amount is still
   included in the category total for that month.
5. **Given** a logged-in user whose recurring expense's category was subsequently deleted, **When**
   they view their recurring expenses list, **Then** the expense is flagged as inactive and they are
   prompted to reassign or remove it.

---

### User Story 6 - Shared Account (Priority: P3)

An account owner can invite one other person to share their account. Both members have their own
login credentials but access the same expenses, categories, and reports. Either member can remove
the other from the shared account.

**Why this priority**: Enables couples or household members to jointly track spending, but the app
delivers full value to a single user without this feature.

**Independent Test**: Can be fully tested by having User A invite User B via email, User B accepting
the invitation, and then verifying that expenses logged by User A appear in User B's reports and
vice versa. Delivers: collaborative household expense tracking.

**Acceptance Scenarios**:

1. **Given** a logged-in account owner, **When** they enter another user's email and send an
   invitation, **Then** that user receives an invitation to join the account.
2. **Given** an invited user, **When** they accept the invitation, **Then** they are linked to the
   shared account and can see all existing expenses, categories, and reports.
3. **Given** two members in a shared account, **When** either member logs an expense, **Then** it
   appears in the reports visible to both members.
4. **Given** two members in a shared account, **When** one member removes the other, **Then** the
   removed member loses access to the shared account and its data.
5. **Given** a user who is already part of a shared account, **When** they try to invite a third
   person, **Then** they are told the account already has the maximum of two members.

---

### Edge Cases

- What happens when a user has no expenses for the selected reporting period? (Empty state displayed)
- What if a recurring expense's category is deleted? (Recurring expense marked inactive; user
  prompted to reassign or remove it)
- What if a user submits an expense with a zero or negative amount? (Validation error; not saved)
- What if two recurring expenses share the same category? (Both apply; amounts are summed in reports)
- Can an expense be dated in the future? (No — the date picker restricts selection to today or
  earlier)
- What if a user has no categories at all? (Prompted to create one before logging an expense)
- What if the invited user does not yet have an account? (They register first, then the invitation
  links their new account to the shared account)
- What happens to shared data if the account owner leaves the shared account? (The remaining member
  retains full access to all shared expenses and becomes the sole account owner)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register with email and password.
- **FR-002**: System MUST allow registered users to log in with email and password.
- **FR-003**: System MUST redirect authenticated users to the main page after successful login or
  registration.
- **FR-004**: System MUST redirect unauthenticated users to the login page when they access any
  protected page.
- **FR-005**: Main page MUST display all expense categories available to the account (system
  defaults and custom categories).
- **FR-006**: Users MUST be able to select a category, enter a positive monetary amount, and save an
  expense from the main page.
- **FR-007**: The expense date field MUST default to today's date; users MUST be able to change it
  to any date up to and including today.
- **FR-008**: System MUST prevent expense dates set in the future from being saved.
- **FR-009**: System MUST persist all saved expenses associated with the account.
- **FR-010**: Reports page MUST display the account's combined expenses for the selected period,
  grouped by category, as a chart.
- **FR-011**: Reports page MUST display spending data as a horizontal bar chart grouped by category.
- **FR-012**: Users MUST be able to select a reporting period (specific month or specific year)
  using a dropdown; the default period MUST be the current month.
- **FR-013**: When a year is selected in the reports dropdown, the chart MUST display monthly
  spending aggregates for that year (12 data points).
- **FR-014**: Categories page MUST list all system-default and account-level custom categories.
- **FR-015**: Users MUST be able to create a custom category by providing a title, selecting an icon
  from a predefined icon set, and selecting a color from a predefined color set.
- **FR-016**: Category titles MUST be unique within an account's category list (case-insensitive).
- **FR-017**: Users MUST be able to define a recurring monthly expense with a category, a positive
  amount, and a descriptive label.
- **FR-018**: Recurring expenses MUST be automatically included in the report totals for their
  category for every month from their creation month onwards.
- **FR-019**: Users MUST be able to view a list of all recurring expenses on the account.
- **FR-020**: Users MUST be able to delete a recurring expense; deletion MUST only affect future
  months. Historical report totals for months when the recurring expense was active MUST remain
  unchanged and continue to include its amount.
- **FR-021**: An account owner MUST be able to invite one other user to share the account via email.
- **FR-022**: An invited user MUST be able to accept or decline the invitation.
- **FR-023**: All account data (expenses, categories, recurring expenses, reports) MUST be visible
  and accessible to both members of a shared account.
- **FR-024**: Either account member MUST be able to remove the other member; the removed member MUST
  immediately lose access to the shared account's data.
- **FR-025**: An account MUST support a maximum of two members; inviting a third person MUST be
  prevented with an informative error.

### Key Entities

- **User**: identified by email address; belongs to one account (which may be shared with one other
  user). Owns their own login credentials.
- **Account**: the shared data container. Has one or two member Users. All expenses, categories, and
  recurring expenses belong to an Account, not to individual Users.
- **Category**: has a title, an icon (chosen from a predefined icon set), and an icon color (chosen
  from a predefined color palette). Can be a system default (shared across all accounts,
  non-deletable) or an account-level custom category.
- **Expense**: has a positive monetary amount, a date (today or earlier), belongs to one Category
  and one Account, and records which User logged it.
- **Recurring Expense**: has a positive monetary amount, a text label, belongs to one Category and
  one Account, and applies from its creation month onwards on a monthly basis. Deletion removes
  future occurrences only; historical occurrences remain in reports.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can log a new expense in under 30 seconds from arriving on the main screen.
- **SC-002**: The reports page loads and renders chart data in under 2 seconds for up to 24 months
  of historical data.
- **SC-003**: The application is installable to the home screen on both mobile and desktop browsers.
- **SC-004**: A user can create a custom category in under 60 seconds.
- **SC-005**: 100% of logged and recurring expenses are correctly reflected in the report totals for
  their corresponding month and category, including expenses logged by both account members.
- **SC-006**: A returning user can complete the login flow and reach the main screen in under 10
  seconds.
- **SC-007**: Account sharing invitation is delivered and actionable within 5 minutes of being sent.

## Assumptions

- **Account-level data**: Expenses, categories, and recurring expenses belong to the account, not to
  individual users. Both members of a shared account see all data.
- **Maximum two members**: An account supports exactly one or two members. Group or family accounts
  beyond two members are out of scope.
- **Self-registration**: Users register themselves; there is no admin-managed account provisioning.
- **System default categories**: A set of common expense categories (e.g., Food, Transport,
  Entertainment) is pre-loaded for all accounts and cannot be deleted.
- **Single currency**: The app tracks expenses in a single currency per account. Multi-currency
  support is out of scope.
- **Recurring frequency**: Monthly is the only supported recurrence frequency. Weekly or yearly
  recurring expenses are out of scope.
- **Recurring expense history**: When a recurring expense is deleted, its historical contribution to
  past months' reports is preserved permanently.
- **Year report view**: Selecting a year shows monthly spending aggregates (12 data points).
- **Icon and color sets**: The predefined icon set and color palette are fixed at launch; user-
  uploaded or fully custom icons are out of scope.
- **Social auth extensibility**: Apple ID and Google authentication are deferred to a future
  iteration, but the authentication system MUST be designed so these providers can be added later
  without architectural rework.
- **PWA — manifest only**: The app provides a Web App Manifest for home screen installability.
  Service worker, offline caching, and push notifications are deferred to a future iteration.
- **Stateless authentication**: The backend issues signed JWT tokens verified by signature only; no
  session or token state is stored server-side. Logout clears the client-side cookie. An access
  token remains cryptographically valid for up to its TTL (≤15 min) after logout — this is the
  accepted trade-off for a stateless design. Multi-device session revocation is out of scope.
- **Session duration**: Access tokens have a TTL of ≤15 minutes. Refresh tokens have a TTL of
  30 days; after 30 days of inactivity the user must re-authenticate. Both tokens are stored in
  HttpOnly, Secure, SameSite=Strict cookies and verified by signature only — no server-side storage.

## Clarifications

### Session 2026-02-19

- Q: Does logout require server-side session invalidation? → A: No — logout clears the browser
  cookie client-side only. Access tokens remain valid until TTL expires (≤15 min). No server-side
  token state (refresh token DB table, denylist, or session store) is needed.
- Q: What is the maximum session duration before the user must re-authenticate? → A: 30 days —
  users stay logged in for up to 30 days of inactivity; after that the refresh token expires and
  they must log in again.
