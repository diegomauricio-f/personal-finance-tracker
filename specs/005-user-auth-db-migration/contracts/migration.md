# Contract: Local Data Migration

**Feature**: `005-user-auth-db-migration`
**Pattern**: Client-side detection + Supabase RPC (PostgreSQL stored procedure)

---

## Migration Detection (Client-Side)

**Trigger**: `onMount` / `$effect` in root `+layout.svelte` after session is confirmed.

### Detection Logic
```
1. If !session → skip (user not logged in)
2. Check localStorage key `finance-tracker:migrated` for { userId } matching session.user.id
   a. If migrated for this user AND localStorage has financial data → show "merge or discard" prompt (second device)
   b. If migrated for this user AND no local data → skip (nothing to do)
3. If local data exists AND flag absent (or userId mismatch) → show migration prompt
4. If no local data AND flag absent → skip (new user, nothing to migrate)
```

### localStorage Keys to Check
| Key | Content |
|-----|---------|
| `finance-tracker:wallets` | JSON array of Wallet objects |
| `finance-tracker:transactions` | JSON array of Transaction objects |
| `finance-tracker:categories` | JSON array of custom Category objects (predefined categories NOT stored here) |

### Migration Flag Key
| Key | Format |
|-----|--------|
| `finance-tracker:migrated` | `{ migratedAt: ISO string, userId: string, counts: { wallets, transactions, categories } }` |

The flag stores `userId` to handle shared-device scenarios: if a different user logs in, `userId` won't match and detection runs fresh.

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

Fields are mapped from camelCase (localStorage) to snake_case (RPC) by the client before sending.

```typescript
interface MigrateLocalDataPayload {
  // Only custom categories (type === 'custom' in localStorage Category model)
  // Predefined categories (cat-food, cat-transport, etc.) are already seeded in the DB — do NOT include them
  p_categories: Array<{
    id: string          // UUID (preserved from localStorage; predefined IDs like 'cat-food' must be excluded)
    name: string
    deleted_at?: string | null   // from Category.deletedAt
  }>
  p_wallets: Array<{
    id: string          // UUID (preserved from Wallet.id)
    name: string
    created_at?: string  // from Wallet.createdAt
    deleted_at?: string | null   // from Wallet.deletedAt
  }>
  p_transactions: Array<{
    id: string          // UUID (preserved from Transaction.id)
    wallet_id: string   // from Transaction.walletId
    category_id?: string | null  // from Transaction.categoryId (may be predefined non-UUID like 'cat-food')
    amount: number      // from Transaction.amount (always positive in localStorage)
    type: 'income' | 'expense'   // from Transaction.type
    note?: string       // from Transaction.note
    date: string        // ISO 8601 from Transaction.date
    created_at?: string  // from Transaction.createdAt
    updated_at?: string  // from Transaction.updatedAt
    deleted_at?: string | null
  }>
}
```

**Important**: `category_id` in transactions may reference a predefined category ID (`cat-food`, etc.) which is a non-UUID string. The stored procedure must handle this by looking up predefined categories seeded in the DB, or setting `category_id = NULL` for unresolvable references.

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
1. Write migration flag: `localStorage.setItem('finance-tracker:migrated', JSON.stringify({ migratedAt, userId, counts }))`
2. Keep original data keys intact (do NOT remove them) — required so FR-015 "start fresh" path works for the current session and potential retries
3. Redirect to `/` (dashboard)

**Do NOT** call `supabase.auth.refreshSession()` — migration flag is tracked in localStorage (client-side), not in `app_metadata`. The `finance-tracker:migrated` key with matching `userId` is the sole gate for re-prompting.
