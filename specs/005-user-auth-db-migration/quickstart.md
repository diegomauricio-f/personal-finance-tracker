# Quickstart: User Auth & Cloud DB — Integration Scenarios

**Feature**: `005-user-auth-db-migration` | **Date**: 2026-03-08

---

## Prerequisites

1. Supabase project created at supabase.com
2. Environment variables set:
   ```
   PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server-side only
   ```
3. Email confirmation: configure in Supabase Dashboard → Auth → Settings
4. Redirect URLs registered in Supabase Dashboard:
   - `http://localhost:5173/auth/callback`
   - `https://your-vercel-app.vercel.app/auth/callback`

---

## Scenario 1: New User Registration

**Test manually**:
1. Navigate to `/register`
2. Enter a new email + password (8+ chars)
3. Submit → should redirect to `/auth/verify-email`
4. Check email → click confirmation link → lands on `/auth/callback?code=...`
5. Callback exchanges code → redirects to `/` (dashboard)
6. Dashboard shows empty state (no wallets, no transactions)

**Verify**:
- Supabase Dashboard → Auth → Users → new user appears
- `event.locals.user` is populated in server logs
- Protected routes (`/transactions`, `/wallets`, etc.) accessible
- `/login` redirects to `/` if already authenticated

---

## Scenario 2: Login from Another Device

**Test manually**:
1. Log out
2. Navigate to `/login`
3. Enter credentials → redirect to `/`
4. Dashboard shows same data as original device

**Verify**:
- Session cookie set correctly (check DevTools → Application → Cookies)
- `locals.user` matches expected user ID

---

## Scenario 3: Local Data Migration (Existing User with localStorage Data)

**Test manually**:
1. Open app in a fresh browser session (not logged in)
2. Manually set localStorage data to simulate existing user:
   ```javascript
   const walletId = crypto.randomUUID()
   localStorage.setItem('finance-tracker:wallets', JSON.stringify([
     { id: walletId, name: 'Efectivo', createdAt: new Date().toISOString(), deletedAt: null }
   ]))
   localStorage.setItem('finance-tracker:transactions', JSON.stringify([
     {
       id: crypto.randomUUID(), walletId, categoryId: 'cat-food',
       amount: 100, type: 'expense', date: new Date().toISOString(),
       createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
     }
   ]))
   // Note: finance-tracker:categories only stores CUSTOM categories, not predefined ones
   localStorage.setItem('finance-tracker:categories', JSON.stringify([]))
   ```
3. Register a new account OR login with existing account (no migration flag)
4. After auth → migration prompt appears with summary
5. Click "Migrar a la nube"
6. Wait for RPC call to complete
7. Redirect to dashboard → data visible

**Verify**:
- Supabase Dashboard → Table Editor → `wallets` and `transactions` contain migrated rows
- `migration_log` table has 1 entry for this user
- `localStorage.getItem('finance-tracker:migrated')` contains `{ userId, migratedAt, counts }`
- Reloading the app does NOT show migration prompt again (flag userId matches session user)

---

## Scenario 4: Migration Retry (Simulated Failure)

**Test manually**:
1. Set localStorage data (as in Scenario 3)
2. Login → migration prompt appears
3. Simulate network failure (DevTools → Network → Offline) → click "Migrar"
4. Error state appears with retry button
5. Re-enable network → click retry
6. Migration succeeds

**Verify**:
- No partial data in Supabase tables after failed attempt
- After retry, all data appears correctly

---

## Scenario 5: Second Device (Local Data + Existing Cloud Data)

**Test manually**:
1. Complete migration on Device A (Scenario 3)
2. Open app on Device B (new browser session)
3. Add different localStorage data (different UUIDs for wallets/transactions)
4. Login with same account
5. Different prompt appears: "merge or discard" (migration flag already set)
6. Choose "Merge" → new local records added; existing cloud records untouched

**Verify**:
- Cloud has both original + merged records
- No duplicates (same UUIDs not duplicated)

---

## Scenario 6: Password Recovery

**Test manually**:
1. Navigate to `/auth/forgot-password`
2. Enter registered email → success message shown (regardless of email existence)
3. Check email → click recovery link → lands on `/auth/callback?code=...&next=/account/update-password`
4. Callback → redirect to `/account/update-password`
5. Enter new password → submit → redirect to `/`
6. Log out → log in with new password → succeeds

---

## Scenario 7: Protected Route Access (Unauthenticated)

**Test manually**:
1. Log out
2. Navigate directly to `/transactions`
3. Should redirect to `/login?redirectTo=/transactions`
4. Log in → should redirect back to `/transactions`

---

## Supabase Dashboard Verification Checklist

- [ ] Auth → Users: users appear on registration
- [ ] Table Editor → `wallets`: rows have correct `user_id`
- [ ] Table Editor → `transactions`: rows have correct `user_id` and `wallet_id`
- [ ] Table Editor → `categories`: global rows have `user_id = NULL`; custom rows have user UUID
- [ ] Table Editor → `migration_log`: one row per migrated user
- [ ] Auth → Policies: RLS enabled on all 3 user tables with correct policies
- [ ] SQL Editor: `SELECT * FROM wallets WHERE user_id = 'other-user-uuid'` returns 0 rows when authenticated as different user
