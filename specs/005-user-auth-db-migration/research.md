# Research: User Auth, Cloud DB & Local Data Migration

**Feature**: `005-user-auth-db-migration` | **Date**: 2026-03-08
**Stack confirmed by user**: Supabase (Auth + PostgreSQL)

---

## Decision 1: Supabase Auth Integration with SvelteKit

**Decision**: `@supabase/ssr` with cookie-based sessions.

**Rationale**:
- `@supabase/auth-helpers-sveltekit` is deprecated — do not use.
- `@supabase/ssr` provides `createServerClient` (server hooks) and `createBrowserClient` (layout) that handle cookie read/write automatically.
- JWTs stored in cookies (not localStorage) so the server can validate sessions on every request — required for SSR route protection.
- Uses PKCE flow by default (not implicit), requiring an `/auth/callback` route to exchange the code for a session.

**Packages needed**:
- `@supabase/supabase-js` ^2.x
- `@supabase/ssr` ^0.x

**Key patterns**:
- `hooks.server.ts`: create `createServerClient` fresh per request, call `getUser()` (not `getSession()` — the latter doesn't validate the JWT with Supabase servers), attach `supabase`, `session`, `user` to `event.locals`.
- `+layout.svelte`: create `createBrowserClient` once, call `onAuthStateChange` in `$effect`, use `invalidate('supabase:auth')` to re-run server load functions on auth state change.
- `+layout.server.ts`: call `depends('supabase:auth')`, return `session` to client.
- Always use `setAll` (not `set`) for cookies — Supabase writes multiple cookies atomically.
- Always allow `content-range` header through `filterSerializedResponseHeaders`.

**Alternatives considered**:
- Lucia Auth (self-hosted) — more control, much more setup, no managed auth UI.
- Clerk — better DX but adds cost and external dependency.
- Auth.js (formerly NextAuth) — SvelteKit adapter exists but not as mature as Supabase integration.

---

## Decision 2: Route Protection Strategy

**Decision**: SvelteKit route groups with `+layout.server.ts` guard.

**Rationale**: Group protected routes under `src/routes/(app)/` and public routes under `src/routes/(auth)/`. A `+layout.server.ts` at `(app)/` checks `locals.user` and throws `redirect(303, '/login')` if absent. Handles `redirectTo` query param so users return to original destination after login.

**Auth callback route required**: `src/routes/auth/callback/+server.ts` exchanges PKCE code for session (used by email confirmation and password recovery).

**Form actions over fetch**: Use `+page.server.ts` form actions for signUp, signInWithPassword, signOut — they work without JS (progressive enhancement) and keep credentials out of client-side code.

---

## Decision 3: Database Schema

**Decision**: Four tables with RLS, single `categories` table with `user_id IS NULL` sentinel for global categories.

**Tables**: `wallets`, `transactions`, `categories`, `migration_log`

**RLS strategy**:
- All user tables: `ENABLE ROW LEVEL SECURITY`
- SELECT policies: `user_id = auth.uid() AND deleted_at IS NULL`
- INSERT policies: `user_id = auth.uid()` (cannot insert with NULL user_id)
- UPDATE policies: `user_id = auth.uid()` (covers soft-delete mutations)
- Categories SELECT: `(user_id IS NULL) OR (user_id = auth.uid() AND deleted_at IS NULL)`
- Global categories seeded by migration script running under service role (bypasses RLS)

**Soft deletes**: `deleted_at TIMESTAMPTZ` on wallets, transactions, categories. SELECT policies filter `deleted_at IS NULL` automatically — no app-level filtering needed.

**FKs**: `user_id REFERENCES auth.users(id) ON DELETE CASCADE` (GDPR-friendly purge on account deletion).

**Indexes**: Partial composite indexes excluding soft-deleted rows — `(user_id, date DESC)` for transactions, `(user_id)` for wallets, `(wallet_id)` and `(user_id, category_id)` for transactions.

**Realtime**: Opt-in for wallets only. Primary sync strategy: optimistic UI updates + refetch-on-window-focus (`invalidateAll()`). Supabase Realtime adds WebSocket overhead not warranted for a personal finance app.

**Alternatives considered**:
- Separate `global_categories` table — cleaner separation but requires UNION queries and two policy sets.
- No soft deletes on server — rejected; existing app logic relies on soft deletes and they are needed for migration idempotency.

---

## Decision 4: Local Data Migration to Supabase

**Decision**: Single PostgreSQL stored procedure via `supabase.rpc()` — atomic, idempotent, preserving client UUIDs.

**Atomicity**: PostgREST wraps every `rpc()` call in a single PostgreSQL transaction automatically. One stored procedure receives all data (categories, wallets, transactions as JSONB arrays) and inserts them in topological order. Any error triggers automatic full rollback — no partial-migration states possible.

**Insert order** (dependency-safe within single transaction):
1. Custom categories (no FK dependencies)
2. Wallets (no FK on categories or transactions)
3. Transactions (depends on wallets and categories)

**UUID strategy**: Preserve client-generated UUIDs. PostgreSQL accepts any valid UUID v4 on insert. Preserving UUIDs maintains FK consistency within the migrated dataset and enables idempotent retries via `ON CONFLICT (id) DO NOTHING`.

**Migration flag**: `raw_app_meta_data.local_migration_completed = true` set inside the stored procedure as its final step (server-side, service-role-only, tamper-resistant). Cached in localStorage for fast-path checks on subsequent loads.

**Detection**: Client-side only (`onMount` / `$effect`). After auth session confirmed, check localStorage keys + `app_metadata` flag. If local data exists and flag is absent → show migration prompt.

**Retry strategy**: 2–3 automatic retries with exponential backoff (1s, 3s, 9s) for transient network errors. On exhaustion → user-visible error with manual retry button. Never retry partial migrations — always full-migration retry.

**Second-device conflict** (local data + existing cloud data):
- If migration flag already set → do NOT auto-migrate. Show prompt: "Merge" (upsert with `DO NOTHING` on conflict) or "Discard local".
- Server data wins by default. Never auto-overwrite cloud financial records.

**Alternatives considered**:
- Multiple sequential `supabase.from().insert()` calls — no atomicity, partial-migration states possible. Rejected.
- Edge Function with native transaction — more DX control but requires separate deployment. Overkill for this use case.

---

## Decision 5: Environment & Security

- `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`: safe to expose to browser; RLS is the security layer.
- `SUPABASE_SERVICE_ROLE_KEY`: server-side only (never in browser). Used for migration RPC that bypasses RLS to set `app_metadata`.
- All Supabase Dashboard redirect URLs must be registered (email confirmation, password recovery).
