# Contract: Local Data Migration

**Feature**: `005-user-auth-db-migration`
**Pattern**: Client-side detection + Supabase RPC (PostgreSQL stored procedure)

---

## Migration Detection (Client-Side)

**Trigger**: `onMount` / `$effect` in root `+layout.svelte` after session is confirmed.

### Detection Logic
```
1. If !session → skip (user not logged in)
2. If session.user.app_metadata.local_migration_completed === true:
   a. If localStorage has financial data → show "merge or discard" prompt (second device)
   b. Else → skip (nothing to do)
3. If local data exists AND flag absent → show migration prompt
4. If no local data AND flag absent → skip (new user, nothing to migrate)
```

### localStorage Keys to Check
| Key | Content |
|-----|---------|
| `wallets` | JSON array of wallet objects |
| `transactions` | JSON array of transaction objects |
| `categories` | JSON array of custom category objects |

---

## Migration Prompt UI Contract

Shown as a blocking modal/page before dashboard access.

### Summary display
- "Encontramos X billeteras, Y transacciones y Z categorías en este dispositivo."
- Two CTAs: **"Migrar a la nube"** / **"Empezar desde cero"**

### User choices
| Choice | Action |
|--------|--------|
| Migrate | Call `migrate_local_data` RPC → on success, clear localStorage migration keys → redirect to `/` |
| Start fresh | Clear migration flag in localStorage (set sentinel) → redirect to `/` |

---

## RPC: `migrate_local_data`

**Called via**: `supabase.rpc('migrate_local_data', payload)`
**Transaction**: Automatic (PostgREST wraps RPC calls in a single transaction)
**Auth**: Anon key (RLS applies); procedure uses `auth.uid()` to scope inserts

### Request Payload
```typescript
interface MigrateLocalDataPayload {
  p_categories: Array<{
    id: string          // UUID (preserved from localStorage)
    name: string
    type: 'income' | 'expense'
    icon?: string
    deleted_at?: string | null
  }>
  p_wallets: Array<{
    id: string          // UUID (preserved)
    name: string
    created_at?: string
    deleted_at?: string | null
  }>
  p_transactions: Array<{
    id: string          // UUID (preserved)
    wallet_id: string
    category_id?: string | null
    amount: number
    type: 'income' | 'expense'
    note?: string
    date: string        // ISO 8601
    deleted_at?: string | null
  }>
}
```

### Response
```typescript
interface MigrateLocalDataResult {
  success: boolean
  migrated: {
    categories: number
    wallets: number
    transactions: number
  }
  error?: string
}
```

### Conflict Strategy
All inserts use `ON CONFLICT (id) DO NOTHING` — safe for retries. Records with matching UUIDs already in the DB are silently skipped.

### Execution Order (inside stored procedure)
1. INSERT custom categories
2. INSERT wallets
3. INSERT transactions
4. INSERT into `migration_log`
5. Set `raw_app_meta_data.local_migration_completed = true` via `auth.users` update

### Error Cases
| Error | Client behavior |
|-------|----------------|
| FK violation (wallet not found for transaction) | Full rollback — retry with full payload |
| Network timeout | Retry up to 3× with exponential backoff (1s, 3s, 9s) |
| User already migrated (`migration_log` unique violation) | Idempotent — procedure should handle gracefully |
| Unknown PostgreSQL error | Show error, offer manual retry |

---

## Second-Device Merge RPC: `merge_local_data`

Same as `migrate_local_data` but:
- Does NOT update `raw_app_meta_data` (flag already set)
- Does NOT insert into `migration_log` (already exists)
- Same `ON CONFLICT DO NOTHING` strategy — new UUIDs added, existing skipped

Can reuse the same stored procedure with an `p_is_merge BOOLEAN` parameter.

---

## Post-Migration Client Cleanup

After successful RPC response:
1. Set localStorage sentinel: `localStorage.setItem('migration_status', 'completed')`
2. Remove migrated data keys OR keep them (read-only, no further writes)
3. Call `supabase.auth.refreshSession()` to get updated `app_metadata` in session
4. Redirect to `/` (dashboard)
