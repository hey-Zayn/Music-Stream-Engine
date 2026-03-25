# MusicApp — Backend Unit Test Report

**Framework:** Vitest v4.1.1 &nbsp;|&nbsp; **Language:** TypeScript &nbsp;|&nbsp; **Date:** March 26, 2026 &nbsp;|&nbsp; **Branch:** `Live-0`

---

## Summary

| Metric | Result |
|--------|--------|
| ✅ Tests Passed | **18** |
| ❌ Tests Failed | **0** |
| 📁 Test Suites | **3** |
| ⏱ Duration | **3.3s** |
| 📊 Pass Rate | **100%** |

```
 Test Files   3 passed (3)
      Tests  18 passed (18)
   Duration  3.30s
```

---

## Suite 1 — `admin.controller.test.ts` &nbsp; `3 / 3 passed`

> Tests the `checkAdmin` endpoint — verifies Clerk-based RBAC authorization logic.

| Status | Group | Test | Duration |
|--------|-------|------|----------|
| ✅ | `checkAdmin` | should return 401 if no userId is provided | 11ms |
| ✅ | `checkAdmin` | should return admin: true if user email matches ADMIN_EMAIL | 6ms |
| ✅ | `checkAdmin` | should return admin: false if user email does not match ADMIN_EMAIL | 1ms |

---

## Suite 2 — `user.controller.test.ts` &nbsp; `8 / 8 passed`

> Tests `getAllUser` (user listing) and `getMessage` (message history retrieval).

| Status | Group | Test | Duration |
|--------|-------|------|----------|
| ✅ | `getAllUser` | should return 200 with a list of users (excluding current user) | 21ms |
| ✅ | `getAllUser` | should return an empty array when no other users exist | 3ms |
| ✅ | `getAllUser` | should call next() with error when database fails | 2ms |
| ✅ | `getAllUser` | should call next() if req.auth is null | 1ms |
| ✅ | `getMessage` | should return 200 with sorted messages between two users | 8ms |
| ✅ | `getMessage` | should return 200 with an empty array when no messages exist | 1ms |
| ✅ | `getMessage` | should call next() with error on database failure | 1ms |
| ✅ | `getMessage` | should sort messages in ascending createdAt order | 1ms |

---

## Suite 3 — `message.controller.test.ts` &nbsp; `7 / 7 passed`

> Tests `sendMessage` (input validation) and `getUnreadCount` (unread badge logic).

| Status | Group | Test | Duration |
|--------|-------|------|----------|
| ✅ | `sendMessage` | should return 400 if receiverId is missing | 21ms |
| ✅ | `sendMessage` | should return 400 if content is an empty string | 4ms |
| ✅ | `sendMessage` | should return 400 if content is only whitespace | 2ms |
| ✅ | `sendMessage` | should return 400 if receiverId is an empty string | 2ms |
| ✅ | `getUnreadCount` | should return 200 with unread count for authenticated user | 2ms |
| ✅ | `getUnreadCount` | should return count of 0 when no unread messages exist | 7ms |
| ✅ | `getUnreadCount` | should call next() when the database throws an error | 3ms |

---

## Test Scope

| Controller | Functions Tested | Edge Cases |
|---|---|---|
| `admin.controller.js` | `checkAdmin` | No auth, email match, email mismatch |
| `user.controller.js` | `getAllUser`, `getMessage` | Empty results, DB failure, null auth, sort order |
| `message.controller.js` | `sendMessage`, `getUnreadCount` | Missing fields, whitespace, DB failure, zero count |

---

## How to Reproduce

```bash
cd backend
npm test
```

> All tests are isolated — **no database, no network, no Clerk API calls** are made. All external dependencies are mocked.
