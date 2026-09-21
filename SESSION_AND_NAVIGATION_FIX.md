# UwoConnect Mobile – Session & Navigation Fix

**Date**: September 2026  
**Scope**: `uwomobile` (Expo Router / React Native)  
**Backend**: No changes required

---

## 1. Root Causes

### 1.1 Logout Data Leakage (Cross-Account State Bleed)

When User A logged out and User B logged in, the following user-scoped state was **not** being cleared:

| State Source | Problem |
|---|---|
| **React-Query cache** | Stale queries (dashboard, inbox, CRM, leads) from User A were served to User B |
| **Inbox WebSocket** | Socket remained connected with User A's token, pushing User A's messages into the UI |
| **Zustand stores** (`brandStore`, `drawerStore`) | Retained User A's tenant branding and drawer state |
| **In-flight Axios requests** | Requests initiated by User A could resolve after User B logged in, populating the UI with wrong data |
| **SecureStore** | Only the access token and user profile keys were deleted; refresh token and brand config remained |
| **Content cache** | File-system cache of dynamic content (banners, features) was never purged |
| **Navigation stack** | No `router.replace()` was called, so pressing Back could navigate back into the authenticated app |

### 1.2 Android Hardware Back Button Exit

The `app/(app)/_layout.tsx` layout defined a flat `<Tabs>` navigator with ~25 detail screens declared as `<Tabs.Screen options={{ href: null }}>` (hidden tabs). In React Navigation, tabs do not maintain a push/pop history stack for hidden screens, so pressing the Android Back button on any nested screen exhausted the tab navigator and popped the parent `(app)` stack—exiting to the Android home screen.

---

## 2. Architecture

### 2.1 Centralized Session Lifecycle (`src/services/sessionLifecycle.ts`)

A single `logoutAndResetSession()` function performs a deterministic, ordered teardown:

```
1. inboxWebSocket.resetAndDisconnect()      — close socket + clear ALL listeners
2. cancelAllPendingRequests()                — abort every in-flight Axios request
3. queryClient.cancelQueries() + .clear()    — purge React-Query cache
4. secureStorage.removeAccessToken()         — delete JWT
5. secureStorage.deleteItem(refreshToken)    — delete refresh token
6. secureStorage.deleteItem(userProfile)     — delete cached user
7. secureStorage.deleteItem(brandConfig)     — delete cached brand
8. useSessionStore.setState(initial)         — reset session Zustand store
9. useBrandStore.getState().reset()          — reset brand Zustand store
10. useDrawerStore.getState().reset()        — reset drawer Zustand store
11. contentCacheStorage.deleteItem(cache)    — purge file-system content cache
12. router.replace('/(auth)/login')          — clear navigation stack
```

**Concurrency guard**: A `logoutInProgress` flag prevents multiple concurrent calls (e.g. from simultaneous 401 responses).

**401 loop guard**: The API client sets an `isLoggingOut` flag to prevent recursive `401 → logout → 401` cycles.

### 2.2 API Client Hardening (`src/api/client.ts`)

- **AbortController registry**: Every Axios request is assigned an `AbortController`. All controllers are tracked in a `Set`. On logout, `cancelAllPendingRequests()` aborts them all.
- **401 auto-logout**: The response interceptor detects 401 errors and triggers `logoutAndResetSession()` (with the loop guard active).
- **Fresh token reads**: The request interceptor always reads the latest token from SecureStore, ensuring correct authorization after account switches.

### 2.3 WebSocket Reset (`src/services/inboxWebSocket.ts`)

Added `resetAndDisconnect()` which calls the existing `disconnect()` **and** clears all event listeners from the `Set<WebSocketListener>`. This ensures no stale listener from User A's session can process messages in User B's session.

### 2.4 Zustand Store Resets

Each user-scoped store now exports a `reset()` method:
- **`brandStore.reset()`** — restores brand to `APP_CONFIG.defaultBrand` defaults
- **`drawerStore.reset()`** — sets `isOpen: false`
- **`sessionStore`** — reset via `setState()` in the lifecycle service (status → unauthenticated, token/user/error → null)

### 2.5 Android Back Handler (`src/hooks/useAndroidBackHandler.ts`)

A custom React hook that registers a `BackHandler` listener on Android:

1. **Root tab detection**: If on a root tab (`home`, `inbox`, `crm`, `more`), the native behavior (exit/minimize) is allowed.
2. **Stack pop**: If `router.canGoBack()` returns true, `router.back()` is called.
3. **Fallback**: If stuck on a nested screen with no history, navigates to `/(app)/home`.

The hook is wired into `app/(app)/_layout.tsx` so it's active across all authenticated screens.

---

## 3. Files Changed

| File | Change |
|---|---|
| `src/services/sessionLifecycle.ts` | **NEW** – Centralized logout/reset service |
| `src/hooks/useAndroidBackHandler.ts` | **NEW** – Android hardware back handler hook |
| `src/api/client.ts` | AbortController registry, `cancelAllPendingRequests()`, 401 auto-logout |
| `src/services/inboxWebSocket.ts` | Added `resetAndDisconnect()` method |
| `src/stores/sessionStore.ts` | `logout()` now delegates to `logoutAndResetSession()` |
| `src/stores/brandStore.ts` | Added `reset()` method |
| `src/stores/drawerStore.ts` | Added `reset()` method |
| `src/components/SidebarDrawer.tsx` | `handleLogout()` uses centralized service |
| `app/(app)/more.tsx` | Logout button uses centralized service |
| `app/(app)/_layout.tsx` | Imported and activated `useAndroidBackHandler` |

---

## 4. Testing Checklist

### Account Switching (Data Leakage)
- [ ] Login as User A → verify dashboard shows User A's data
- [ ] Logout User A
- [ ] Login as User B → verify dashboard shows User B's data (not User A's)
- [ ] Check Inbox → should only show User B's conversations
- [ ] Check CRM → should only show User B's leads
- [ ] Logout User B → Login as User A → verify no data from User B

### WebSocket
- [ ] After logout, verify no WebSocket events are received
- [ ] After login, verify WebSocket reconnects with the new token

### Android Back Button
- [ ] Home → Inbox → Conversation → Press Back → Should return to Inbox
- [ ] Home → More → Settings → Press Back → Should return to More
- [ ] Home → Press Back → Should minimize/exit app
- [ ] After logout → Press Back → Should NOT return to dashboard

### 401 Auto-Logout
- [ ] Simulate expired token → app should automatically redirect to login
- [ ] Verify no infinite loop (check console for repeated logout messages)

### TypeScript
- [x] `npm run type-check` passes with 0 errors
