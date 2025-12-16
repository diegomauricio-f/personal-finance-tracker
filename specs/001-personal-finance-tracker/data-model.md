# Data Model

**Feature**: Personal Finance Tracker
**Date**: 2025-10-19
**Storage**: Browser LocalStorage (JSON serialization)

## Overview

This document defines the data entities, relationships, validation rules, and state transitions for the Personal Finance Tracker application. All data is stored locally in the browser's LocalStorage as JSON.

---

## Entities

### Transaction

Represents a single financial event (income or expense).

**TypeScript Interface**:
```typescript
interface Transaction {
  id: string;                    // UUID v4
  date: Date;                    // Transaction date (ISO 8601 string in storage)
  amount: number;                // Monetary amount (can be negative, cannot be zero)
  type: 'income' | 'expense';    // Transaction type
  categoryId: string;            // FK to Category.id
  walletId: string;              // FK to Wallet.id
  note?: string;                 // Optional user note
  createdAt: Date;               // Timestamp of creation (ISO 8601 string)
  updatedAt: Date;               // Timestamp of last modification (ISO 8601 string)
}
```

**Validation Rules** (from spec FR-002, FR-018, FR-023, FR-024):
- `id`: Required, unique, UUID v4 format
- `date`: Required, valid date, cannot be more than 1 year in the future (edge case handling)
- `amount`: Required, number, cannot be zero (FR-023), can be negative (FR-024)
- `type`: Required, must be 'income' or 'expense'
- `categoryId`: Required, must reference existing active or deleted category
- `walletId`: Required, must reference existing active or deleted wallet
- `note`: Optional, max 500 characters
- `createdAt`, `updatedAt`: Auto-generated, immutable (createdAt), auto-updated (updatedAt)

**Relationships**:
- Belongs to ONE Category (categoryId → Category.id)
- Belongs to ONE Wallet (walletId → Wallet.id)

**Indexes** (in-memory for performance):
- By `date` (for date range queries, monthly trends)
- By `walletId` (for wallet-specific views)
- By `categoryId` (for category summaries)

**State Transitions**:
None - transactions don't have state. They can be created, updated, or hard deleted (per spec FR-012).

**Business Rules**:
- Negative expense increases wallet balance (refund scenario)
- Negative income decreases wallet balance (correction scenario)
- Transactions linked to soft-deleted wallets remain accessible but wallet is hidden in UI
- Transactions linked to soft-deleted categories remain accessible but category is hidden in UI

---

### Wallet

Represents a financial account or payment source (cash, bank account, payment app).

**TypeScript Interface**:
```typescript
interface Wallet {
  id: string;                    // UUID v4
  name: string;                  // User-defined name
  balance: number;               // Current balance (calculated, not stored)
  createdAt: Date;               // Timestamp of creation (ISO 8601 string)
  deletedAt: Date | null;        // Soft delete timestamp (null = active)
}
```

**Validation Rules** (from spec FR-001, FR-027):
- `id`: Required, unique, UUID v4 format
- `name`: Required, unique among active wallets (case-sensitive per FR-027), 1-100 characters
- `balance`: Calculated field (not validated, derived from transactions)
- `createdAt`: Auto-generated, immutable
- `deletedAt`: Optional, null for active wallets, Date for soft-deleted

**Relationships**:
- Has MANY Transactions (Wallet.id ← Transaction.walletId)

**Indexes** (in-memory for performance):
- By `deletedAt` (to filter active vs. deleted wallets)

**State Transitions**:
```
[Created] ────────────────> [Active (deletedAt = null)]
                                   │
                                   │ User deletes wallet
                                   ▼
                            [Soft Deleted (deletedAt = Date)]
```

**Business Rules**:
- Balance calculation: SUM of all transactions where transaction.walletId = wallet.id
  - Income transactions add to balance
  - Expense transactions subtract from balance
  - Negative amounts reverse the effect (negative expense = refund)
- Soft-deleted wallets excluded from:
  - Wallet selection dropdowns (FR-022)
  - Total balance calculations (FR-022)
  - Wallet overview list
- Soft-deleted wallets included in:
  - Transaction history (show wallet name but indicate "deleted")
  - Historical balance calculations for past periods

---

### Category

Represents a classification for transactions (predefined or custom).

**TypeScript Interface**:
```typescript
interface Category {
  id: string;                    // UUID v4 for custom, fixed ID for predefined
  name: string;                  // Category name
  type: 'predefined' | 'custom'; // Category type
  createdAt: Date;               // Timestamp of creation (ISO 8601 string)
  deletedAt: Date | null;        // Soft delete timestamp (null = active, only for custom)
}
```

**Validation Rules** (from spec FR-004, FR-005, FR-025):
- `id`: Required, unique, UUID v4 for custom, fixed string for predefined (e.g., 'cat-food')
- `name`: Required, unique among active categories, 1-50 characters
- `type`: Required, must be 'predefined' or 'custom'
- `createdAt`: Auto-generated, immutable
- `deletedAt`: Optional, only applicable to custom categories (predefined cannot be deleted per FR-004)

**Relationships**:
- Has MANY Transactions (Category.id ← Transaction.categoryId)

**Indexes** (in-memory for performance):
- By `type` and `deletedAt` (to filter active predefined/custom categories)

**State Transitions**:

**Predefined Categories**:
```
[Created] ─────────> [Active (deletedAt = null, immutable)]
```

**Custom Categories**:
```
[Created] ────────────────> [Active (deletedAt = null)]
                                   │
                                   │ User deletes category
                                   ▼
                            [Soft Deleted (deletedAt = Date)]
```

**Business Rules**:
- Predefined categories:
  - Fixed set: food, transport, salary, entertainment, utilities, healthcare, other
  - Cannot be deleted (FR-004)
  - Cannot be edited
  - Always available in selection dropdowns
- Custom categories:
  - Created by users (FR-005)
  - Can be soft-deleted (FR-025)
  - Name must be unique among active categories (both predefined and custom)
- Soft-deleted categories excluded from:
  - Category selection dropdowns (FR-026)
  - Category summary views (FR-026)
- Soft-deleted categories included in:
  - Transaction history (show category name but indicate "deleted")

---

### AppSettings (Optional - Future Enhancement)

Stores application preferences and metadata.

**TypeScript Interface**:
```typescript
interface AppSettings {
  version: string;               // Data schema version (for migrations)
  locale: 'es' | 'en';          // User language preference
  currency: string;              // Currency code (e.g., 'USD', 'EUR', 'MXN')
  currencySymbol: string;        // Currency symbol (e.g., '$', '€')
  dateFormat: string;            // Preferred date format
  lastBackup: Date | null;       // Timestamp of last data export (future feature)
}
```

**Note**: This entity is not required for MVP but provides a migration path for user preferences.

---

## Relationships Diagram

```
┌──────────────┐
│   Wallet     │
│  - id        │
│  - name      │
│  - deletedAt │
└──────┬───────┘
       │
       │ 1:N
       │
       ▼
┌──────────────────┐         ┌──────────────┐
│   Transaction    │ N:1     │   Category   │
│  - id            ├────────>│  - id        │
│  - walletId  (FK)│         │  - name      │
│  - categoryId(FK)│         │  - type      │
│  - amount        │         │  - deletedAt │
│  - type          │         └──────────────┘
│  - date          │
└──────────────────┘
```

---

## Data Storage Schema

### LocalStorage Keys

```
finance-tracker:transactions  →  JSON array of Transaction objects
finance-tracker:wallets       →  JSON array of Wallet objects
finance-tracker:categories    →  JSON array of Category objects (custom only)
finance-tracker:settings      →  JSON object of AppSettings
finance-tracker:version       →  String (schema version for migrations)
```

**Serialization Format**:
```json
{
  "finance-tracker:transactions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "date": "2025-10-19T10:30:00.000Z",
      "amount": -50.00,
      "type": "expense",
      "categoryId": "cat-food",
      "walletId": "wallet-001",
      "note": "Grocery shopping",
      "createdAt": "2025-10-19T10:30:00.000Z",
      "updatedAt": "2025-10-19T10:30:00.000Z"
    }
  ],
  "finance-tracker:wallets": [
    {
      "id": "wallet-001",
      "name": "Cash",
      "createdAt": "2025-10-01T00:00:00.000Z",
      "deletedAt": null
    }
  ],
  "finance-tracker:categories": [
    {
      "id": "custom-001",
      "name": "Freelance Income",
      "type": "custom",
      "createdAt": "2025-10-05T12:00:00.000Z",
      "deletedAt": null
    }
  ],
  "finance-tracker:version": "1.0.0"
}
```

---

## Predefined Categories (Constants)

These categories are hardcoded in the application and always available:

```typescript
const PREDEFINED_CATEGORIES: Category[] = [
  {
    id: 'cat-food',
    name: 'Food',
    type: 'predefined',
    createdAt: new Date('2025-01-01'),
    deletedAt: null
  },
  {
    id: 'cat-transport',
    name: 'Transport',
    type: 'predefined',
    createdAt: new Date('2025-01-01'),
    deletedAt: null
  },
  {
    id: 'cat-salary',
    name: 'Salary',
    type: 'predefined',
    createdAt: new Date('2025-01-01'),
    deletedAt: null
  },
  {
    id: 'cat-entertainment',
    name: 'Entertainment',
    type: 'predefined',
    createdAt: new Date('2025-01-01'),
    deletedAt: null
  },
  {
    id: 'cat-utilities',
    name: 'Utilities',
    type: 'predefined',
    createdAt: new Date('2025-01-01'),
    deletedAt: null
  },
  {
    id: 'cat-healthcare',
    name: 'Healthcare',
    type: 'predefined',
    createdAt: new Date('2025-01-01'),
    deletedAt: null
  },
  {
    id: 'cat-other',
    name: 'Other',
    type: 'predefined',
    createdAt: new Date('2025-01-01'),
    deletedAt: null
  }
];
```

---

## Calculated Fields

### Wallet Balance

**Formula**:
```typescript
function calculateWalletBalance(walletId: string, transactions: Transaction[]): number {
  return transactions
    .filter(t => t.walletId === walletId)
    .reduce((balance, t) => {
      if (t.type === 'income') {
        return balance + t.amount;
      } else { // expense
        return balance - t.amount;
      }
    }, 0);
}
```

**Note**: Negative amounts reverse the effect (negative expense adds to balance).

### Total Balance (All Active Wallets)

**Formula**:
```typescript
function calculateTotalBalance(
  wallets: Wallet[],
  transactions: Transaction[]
): number {
  const activeWallets = wallets.filter(w => w.deletedAt === null);
  return activeWallets.reduce((total, wallet) => {
    return total + calculateWalletBalance(wallet.id, transactions);
  }, 0);
}
```

### Savings Rate

**Formula**:
```typescript
function calculateSavingsRate(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): number {
  const periodTransactions = transactions.filter(
    t => t.date >= startDate && t.date <= endDate
  );

  const totalIncome = periodTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = periodTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = totalIncome - totalExpenses;

  if (totalIncome === 0) return 0;

  return (savings / totalIncome) * 100; // Percentage
}
```

### Category Summary

**Formula**:
```typescript
interface CategorySummary {
  categoryId: string;
  categoryName: string;
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
}

function calculateCategorySummary(
  transactions: Transaction[],
  categories: Category[],
  startDate: Date,
  endDate: Date
): CategorySummary[] {
  const activeCategories = categories.filter(c => c.deletedAt === null);

  return activeCategories.map(category => {
    const categoryTransactions = transactions.filter(
      t => t.categoryId === category.id &&
           t.date >= startDate &&
           t.date <= endDate
    );

    const totalIncome = categoryTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = categoryTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      categoryId: category.id,
      categoryName: category.name,
      totalIncome,
      totalExpenses,
      transactionCount: categoryTransactions.length
    };
  });
}
```

---

## Data Migrations

### Schema Versioning

**Current Version**: 1.0.0

**Migration Strategy**:
When data schema changes in future versions:
1. Check `finance-tracker:version` on app load
2. If version mismatch, run migration function
3. Transform old data to new schema
4. Update version number
5. Save migrated data

**Example Migration** (future: add `description` field to Transaction):
```typescript
function migrateV1toV2(data: any): any {
  const transactions = JSON.parse(data['finance-tracker:transactions']);

  const migratedTransactions = transactions.map(t => ({
    ...t,
    description: t.note || '' // Add new field, backfill from note
  }));

  data['finance-tracker:transactions'] = JSON.stringify(migratedTransactions);
  data['finance-tracker:version'] = '2.0.0';

  return data;
}
```

---

## Performance Considerations

### Lazy Loading

For large datasets (>1000 transactions):
- Load transactions in batches (e.g., current month by default)
- Provide pagination for historical views
- Use virtual scrolling for long lists

### Indexing

Build in-memory indexes on app load for fast queries:
```typescript
interface TransactionIndexes {
  byDate: Map<string, Transaction[]>;      // Date string → transactions
  byWallet: Map<string, Transaction[]>;    // WalletId → transactions
  byCategory: Map<string, Transaction[]>;  // CategoryId → transactions
}
```

### Caching

Cache calculated values to avoid recalculation:
- Wallet balances (update on transaction create/update/delete)
- Category summaries (update on transaction create/update/delete)
- Monthly trends (update on transaction create/update/delete)

Use Svelte derived stores for automatic cache invalidation.

---

## Validation with Zod

**Transaction Schema**:
```typescript
import { z } from 'zod';

const TransactionSchema = z.object({
  id: z.string().uuid(),
  date: z.coerce.date(),
  amount: z.number().refine(val => val !== 0, {
    message: 'Amount cannot be zero'
  }),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().min(1),
  walletId: z.string().min(1),
  note: z.string().max(500).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});
```

**Wallet Schema**:
```typescript
const WalletSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  createdAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable()
});
```

**Category Schema**:
```typescript
const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  type: z.enum(['predefined', 'custom']),
  createdAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable()
});
```

---

## Summary

The data model supports all functional requirements:
- ✅ Transaction CRUD with validation (FR-002, FR-011, FR-012, FR-018, FR-023, FR-024)
- ✅ Wallet management with unique names (FR-001, FR-027)
- ✅ Soft deletion for wallets and categories (FR-021, FR-022, FR-025, FR-026)
- ✅ Balance calculations (FR-006, FR-007)
- ✅ Category summaries (FR-015)
- ✅ Savings rate calculation (FR-016)
- ✅ Date range filtering for trends (FR-017)
- ✅ LocalStorage persistence (FR-008, FR-009)

Performance optimizations (indexing, caching, lazy loading) support the <2s dashboard rendering target (SC-011).
