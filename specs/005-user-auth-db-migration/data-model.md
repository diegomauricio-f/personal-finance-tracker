# Data Model: User Auth, Cloud DB & Local Data Migration

**Feature**: `005-user-auth-db-migration` | **Date**: 2026-03-08

---

## Entity Relationship Overview

```
auth.users (Supabase managed)
    │
    ├──< wallets (user_id FK)
    │       │
    │       └──< transactions (wallet_id FK)
    │
    ├──< categories (user_id FK, nullable = global)
    │       │
    │       └──< transactions (category_id FK, nullable)
    │
    └── migration_log (user_id FK, one-per-user)
```

---

## Table: `wallets`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `UUID` | PK, default `gen_random_uuid()` | Client UUID preserved on migration |
| `user_id` | `UUID` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE | RLS anchor |
| `name` | `TEXT` | NOT NULL | Wallet display name |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | Auto-updated by trigger |
| `deleted_at` | `TIMESTAMPTZ` | NULL | Soft delete; NULL = active |

**RLS Policies**:
- SELECT: `user_id = auth.uid() AND deleted_at IS NULL`
- INSERT: `user_id = auth.uid()`
- UPDATE: `user_id = auth.uid()`

**Indexes**:
```sql
CREATE INDEX idx_wallets_user_id ON wallets(user_id) WHERE deleted_at IS NULL;
```

**Computed balance**: Wallet balance is calculated in application layer (sum of transactions), not stored as a column, consistent with existing localStorage implementation.

---

## Table: `categories`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `UUID` | PK, default `gen_random_uuid()` | Client UUID preserved on migration |
| `user_id` | `UUID` | NULLABLE, FK → `auth.users(id)` ON DELETE CASCADE | NULL = global/predefined |
| `name` | `TEXT` | NOT NULL | |
| `name_es` | `TEXT` | NULL | Spanish translation (for predefined) |
| `name_en` | `TEXT` | NULL | English translation (for predefined) |
| `type` | `TEXT` | NOT NULL, CHECK IN ('income','expense') | |
| `icon` | `TEXT` | NULL | Icon identifier |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | |
| `deleted_at` | `TIMESTAMPTZ` | NULL | Soft delete; NULL = active |

**Unique constraint**: `(user_id, name, type)` — prevents duplicate custom categories per user.

**RLS Policies**:
- SELECT: `(user_id IS NULL) OR (user_id = auth.uid() AND deleted_at IS NULL)`
- INSERT: `user_id = auth.uid()` (cannot create global categories from client)
- UPDATE: `user_id = auth.uid()` (cannot modify global categories)

**Seed data**: Predefined categories inserted by migration script using service role (bypasses RLS). They use `name_es` / `name_en` columns instead of i18n keys to match the existing app translation system.

**Indexes**:
```sql
CREATE INDEX idx_categories_user_id ON categories(user_id)
  WHERE user_id IS NOT NULL AND deleted_at IS NULL;
```

---

## Table: `transactions`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `UUID` | PK, default `gen_random_uuid()` | Client UUID preserved on migration |
| `user_id` | `UUID` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE | RLS anchor |
| `wallet_id` | `UUID` | NOT NULL, FK → `wallets(id)` ON DELETE RESTRICT | |
| `category_id` | `UUID` | NULLABLE, FK → `categories(id)` ON DELETE SET NULL | NULL if category deleted |
| `amount` | `NUMERIC(15,2)` | NOT NULL | Always positive; type determines sign |
| `type` | `TEXT` | NOT NULL, CHECK IN ('income','expense') | |
| `note` | `TEXT` | NULL | Optional memo |
| `date` | `TIMESTAMPTZ` | NOT NULL | Transaction datetime |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | Auto-updated by trigger |
| `deleted_at` | `TIMESTAMPTZ` | NULL | Soft delete |

**RLS Policies**:
- SELECT: `user_id = auth.uid() AND deleted_at IS NULL`
- INSERT: `user_id = auth.uid()` AND wallet belongs to `auth.uid()`
- UPDATE: `user_id = auth.uid()`

**Indexes**:
```sql
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_category ON transactions(user_id, category_id)
  WHERE deleted_at IS NULL;
```

---

## Table: `migration_log`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `UUID` | PK, default `gen_random_uuid()` | |
| `user_id` | `UUID` | NOT NULL, UNIQUE, FK → `auth.users(id)` ON DELETE CASCADE | One record per user |
| `migrated_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | When migration completed |
| `wallets_count` | `INTEGER` | NOT NULL, default 0 | Items migrated |
| `transactions_count` | `INTEGER` | NOT NULL, default 0 | |
| `categories_count` | `INTEGER` | NOT NULL, default 0 | |
| `device_info` | `TEXT` | NULL | User agent for diagnostics |

**No RLS** — accessible only via service role (migration RPC runs as service role caller).

---

## Supabase Auth: `auth.users` Extensions

The migration flag is stored in `raw_app_meta_data` (service-role-only write):

```json
{
  "local_migration_completed": true
}
```

User display name and preferences stored in `raw_user_meta_data` (user-writable):

```json
{
  "display_name": "string"
}
```

User settings (language, currency) remain in the existing `userSettings` localStorage key — they are not migrated to the DB in this feature (deferred to a future settings sync feature).

---

## Stored Procedure: `migrate_local_data`

Called via `supabase.rpc('migrate_local_data', payload)` from the client. Runs as a single PostgreSQL transaction (PostgREST auto-wraps RPC calls).

**Input payload** (JSONB):
```json
{
  "p_categories": [ { "id": "uuid", "name": "...", "type": "income|expense" } ],
  "p_wallets":    [ { "id": "uuid", "name": "..." } ],
  "p_transactions": [ {
    "id": "uuid", "wallet_id": "uuid", "category_id": "uuid|null",
    "amount": 100.00, "type": "income|expense",
    "note": "...", "date": "ISO8601"
  }]
}
```

**Execution order**:
1. INSERT custom categories with `ON CONFLICT (id) DO NOTHING`
2. INSERT wallets with `ON CONFLICT (id) DO NOTHING`
3. INSERT transactions with `ON CONFLICT (id) DO NOTHING`
4. INSERT into `migration_log` (counts)
5. UPDATE `auth.users.raw_app_meta_data` to set `local_migration_completed: true`

**Return**: `{ success: boolean, migrated: { categories, wallets, transactions } }`

---

## State Transitions

### User Auth State
```
anonymous → registered (signUp)
registered → authenticated (signInWithPassword)
authenticated → anonymous (signOut)
authenticated → password-reset-pending (resetPasswordForEmail)
password-reset-pending → authenticated (updateUser password)
```

### Local Data Migration State
```
has_local_data → migration_prompted (on login, flag absent)
migration_prompted → migrated (user confirms + RPC succeeds)
migration_prompted → skipped (user chooses "Start fresh")
has_local_data + flag_set → merge_prompted (second device)
merge_prompted → merged (user confirms merge)
merge_prompted → discarded (user discards local data)
```
