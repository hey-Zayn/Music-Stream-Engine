# MusicApp — Backend Unit Tests

> **Testing Framework:** [Vitest](https://vitest.dev/) v4.1.1  
> **Language:** TypeScript  
> **Location:** `backend/src/__tests__/`

---

## 📁 Test Structure

```
backend/
└── src/
    └── __tests__/
        ├── admin.controller.test.ts    # RBAC / Admin auth tests
        ├── user.controller.test.ts     # User listing & message fetch tests
        ├── message.controller.test.ts  # Message send & unread count tests
        └── README.md                   # This file
```

---

## 🚀 Running Tests

From the `backend/` directory:

```bash
# Run all tests once
npm test

# Run tests in watch mode
npx vitest

# Run a specific test file
npx vitest run src/__tests__/admin.controller.test.ts
```

---

## 📊 Test Suites

### `admin.controller.test.ts` — 3 tests
Tests the `checkAdmin` endpoint which verifies if the authenticated user is an admin using Clerk's user management API.

| Test | What it covers |
|------|---------------|
| Returns 401 if no userId | Unauthenticated request guard |
| Returns `admin: true` for matching email | Correct admin identification |
| Returns `admin: false` for non-admin email | Non-admin correctly rejected |

**Key challenge:** Clerk SDK validation requires a live key, so we use a monkey-patching strategy to intercept `clerkClient.users.getUser` directly at runtime — bypassing the CommonJS module cache.

---

### `user.controller.test.ts` — 8 tests
Tests `getAllUser` and `getMessage` controller functions.

| Test | What it covers |
|------|---------------|
| Returns 200 with user list | Happy path — excludes current user |
| Returns empty array | Edge case — only user in system |
| Calls `next(err)` on DB failure | Error propagation |
| Calls `next()` if auth is null | Unauthenticated request guard |
| Returns 200 with messages | Correct query for message history |
| Returns empty array for no messages | Edge case — no conversation yet |
| Calls `next(err)` on DB failure | Error propagation |
| Sorts by `createdAt` ascending | Chronological message ordering |

---

### `message.controller.test.ts` — 7 tests
Tests `sendMessage` (input validation) and `getUnreadCount`.

| Test | What it covers |
|------|---------------|
| Returns 400 if receiverId missing | Required field validation |
| Returns 400 if content is empty | Required field validation |
| Returns 400 for whitespace-only content | Whitespace trim guard |
| Returns 400 if receiverId is empty | Required field validation |
| Returns 200 with count | Happy path — unread messages |
| Returns count of 0 | Edge case — all messages read |
| Calls `next(err)` on DB error | Error propagation |

---

## 🧰 Mocking Strategy

> **Why we don't use `vi.mock()` the normal way for Clerk**

This project uses [Clerk](https://clerk.com/) for authentication. The Clerk SDK (`@clerk/express`) bundles `@clerk/backend` internally, which means standard ES module mocking (`vi.mock('@clerk/backend')`) does **not** intercept calls because the bundled version is already resolved.

**Solution — Monkey-patching:**  
We directly override the `clerkClient.users.getUser` function *after* importing the library, forcing our mock into the exact same runtime reference the controller uses:

```ts
const clerk = require('@clerk/express');
clerk.clerkClient.users.getUser = vi.fn().mockResolvedValue({ ... });
```

This is the only reliable approach in a CommonJS environment with bundled dependencies.

Similarly, Mongoose models export via `module.exports = Model` (no `.default`), so we import them with `require()` and mutate their methods directly.

---

## ⚙️ Configuration

`vitest.config.js` is at the `backend/` root and targets this folder:

```js
test: {
  include: ['src/__tests__/**/*.test.{js,ts}'],
}
```

---

## 📈 Current Results

```
Test Files  3 passed (3)
Tests       18 passed (18)
Pass Rate   100%
Duration    ~3.8s
```

Open [`../../report/test-report.html`](../../report/test-report.html) in a browser for the full visual report.
