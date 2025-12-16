# Svelte Store Contracts

**Feature**: Personal Finance Tracker
**Date**: 2025-10-19
**Purpose**: Define Svelte store interfaces (replaces REST API contracts for local-only app)

## Overview

Since this is a client-side-only application with no backend API, Svelte stores serve as the "API layer" between UI components and the data persistence layer. This document defines the contract for each store, including state shape, methods, and derived values.

---

## Transaction Store

**File**: `src/lib/stores/transactions.ts`

**Purpose**: Manage transaction CRUD operations, filtering, and queries.

### State Shape

```typescript
interface TransactionStore {
  // Readable state
  transactions: Readable<Transaction[]>;
  isLoading: Readable<boolean>;
  error: Readable<string | null>;

  // Methods
  create: (data: CreateTransactionInput) => Promise<Transaction>;
  update: (id: string, data: UpdateTransactionInput) => Promise<Transaction>;
  delete: (id: string) => Promise<void>;
  getById: (id: string) => Transaction | undefined;
  getByWallet: (walletId: string) => Transaction[];
  getByCategory: (categoryId: string) => Transaction[];
  getByDateRange: (start: Date, end: Date) => Transaction[];
  filter: (filters: TransactionFilters) => Transaction[];
}
```

### Input Types

```typescript
interface CreateTransactionInput {
  date: Date;
  amount: number;               // Cannot be zero, can be negative
  type: 'income' | 'expense';
  categoryId: string;
  walletId: string;
  note?: string;
}

interface UpdateTransactionInput {
  date?: Date;
  amount?: number;
  type?: 'income' | 'expense';
  categoryId?: string;
  walletId?: string;
  note?: string;
}

interface TransactionFilters {
  walletId?: string;
  categoryId?: string;
  type?: 'income' | 'expense';
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;         // Search in note field
}
```

### Methods

#### `create(data: CreateTransactionInput): Promise<Transaction>`

**Purpose**: Create a new transaction

**Validation** (FR-018, FR-023, FR-024):
- `amount !== 0` (throw error if zero)
- `walletId` must reference existing active wallet
- `categoryId` must reference existing active category
- All required fields present

**Side Effects**:
- Generates UUID for `id`
- Sets `createdAt` and `updatedAt` to current timestamp
- Persists to LocalStorage
- Updates wallet balance cache
- Updates category summary cache

**Returns**: Created transaction object

**Throws**: `ValidationError` if validation fails

---

#### `update(id: string, data: UpdateTransactionInput): Promise<Transaction>`

**Purpose**: Update an existing transaction

**Validation**:
- Transaction with `id` must exist
- If `amount` provided, cannot be zero
- If `walletId` provided, must reference existing wallet
- If `categoryId` provided, must reference existing category

**Side Effects**:
- Updates `updatedAt` to current timestamp
- Persists to LocalStorage
- Updates affected wallet balance caches (old and new wallets if changed)
- Updates affected category summary caches

**Returns**: Updated transaction object

**Throws**: `NotFoundError` if transaction doesn't exist, `ValidationError` if validation fails

---

#### `delete(id: string): Promise<void>`

**Purpose**: Hard delete a transaction (per spec FR-012)

**Validation**:
- Transaction with `id` must exist

**Side Effects**:
- Removes transaction from storage
- Updates wallet balance cache
- Updates category summary cache

**Returns**: void

**Throws**: `NotFoundError` if transaction doesn't exist

---

#### `getById(id: string): Transaction | undefined`

**Purpose**: Retrieve a single transaction by ID

**Returns**: Transaction object or undefined if not found

---

#### `getByWallet(walletId: string): Transaction[]`

**Purpose**: Retrieve all transactions for a specific wallet (including soft-deleted wallets for historical view)

**Returns**: Array of transactions, sorted by date descending (newest first)

---

#### `getByCategory(categoryId: string): Transaction[]`

**Purpose**: Retrieve all transactions for a specific category (including soft-deleted categories for historical view)

**Returns**: Array of transactions, sorted by date descending

---

#### `getByDateRange(start: Date, end: Date): Transaction[]`

**Purpose**: Retrieve transactions within a date range (inclusive)

**Returns**: Array of transactions, sorted by date descending

---

#### `filter(filters: TransactionFilters): Transaction[]`

**Purpose**: Complex filtering with multiple criteria (FR-010)

**Behavior**:
- Combines all provided filters with AND logic
- Empty filters object returns all transactions

**Returns**: Array of transactions matching all filters, sorted by date descending

---

## Wallet Store

**File**: `src/lib/stores/wallets.ts`

**Purpose**: Manage wallet CRUD operations and balance calculations.

### State Shape

```typescript
interface WalletStore {
  // Readable state
  wallets: Readable<Wallet[]>;          // Active wallets only
  allWallets: Readable<Wallet[]>;        // Includes soft-deleted
  isLoading: Readable<boolean>;
  error: Readable<string | null>;

  // Derived state
  totalBalance: Readable<number>;        // Sum of active wallet balances

  // Methods
  create: (data: CreateWalletInput) => Promise<Wallet>;
  update: (id: string, data: UpdateWalletInput) => Promise<Wallet>;
  softDelete: (id: string) => Promise<void>;
  getById: (id: string) => Wallet | undefined;
  getBalance: (id: string) => number;
}
```

### Input Types

```typescript
interface CreateWalletInput {
  name: string;                 // Unique among active wallets
}

interface UpdateWalletInput {
  name?: string;                // Must remain unique among active wallets
}
```

### Methods

#### `create(data: CreateWalletInput): Promise<Wallet>`

**Purpose**: Create a new wallet

**Validation** (FR-001, FR-027):
- `name` is required, 1-100 characters
- `name` must be unique among active wallets (case-sensitive)

**Side Effects**:
- Generates UUID for `id`
- Sets `createdAt` to current timestamp
- Sets `deletedAt` to null (active)
- Persists to LocalStorage

**Returns**: Created wallet object (with balance = 0)

**Throws**: `ValidationError` if name is duplicate or invalid

---

#### `update(id: string, data: UpdateWalletInput): Promise<Wallet>`

**Purpose**: Update wallet name

**Validation** (FR-027):
- Wallet with `id` must exist and be active
- If `name` provided, must be unique among active wallets

**Side Effects**:
- Persists to LocalStorage
- Wallet balance unchanged (calculated from transactions)

**Returns**: Updated wallet object

**Throws**: `NotFoundError`, `ValidationError`

---

#### `softDelete(id: string): Promise<void>`

**Purpose**: Soft delete a wallet (FR-021)

**Validation**:
- Wallet with `id` must exist and be active

**Behavior** (from clarifications):
- Sets `deletedAt` to current timestamp
- Wallet hidden from UI but data preserved
- All linked transactions remain accessible
- Wallet excluded from:
  - Wallet selection dropdowns (FR-022)
  - Total balance calculations (FR-022)
  - Wallet overview list

**Side Effects**:
- Persists to LocalStorage
- Updates total balance (excludes deleted wallet)

**Returns**: void

**Throws**: `NotFoundError`

---

#### `getById(id: string): Wallet | undefined`

**Purpose**: Retrieve wallet by ID (includes soft-deleted for transaction history display)

**Returns**: Wallet object (with calculated balance) or undefined

---

#### `getBalance(id: string): number`

**Purpose**: Calculate current balance for a wallet (FR-006)

**Calculation**:
```typescript
balance = SUM(
  transactions
    .filter(t => t.walletId === id)
    .map(t => t.type === 'income' ? t.amount : -t.amount)
)
```

**Returns**: Calculated balance (can be negative)

---

### Derived State

#### `totalBalance: Readable<number>`

**Purpose**: Calculate total balance across all active wallets (FR-007)

**Calculation**:
```typescript
totalBalance = SUM(
  wallets
    .filter(w => w.deletedAt === null)
    .map(w => getBalance(w.id))
)
```

**Updates**: Automatically recalculates when transactions or wallets change

---

## Category Store

**File**: `src/lib/stores/categories.ts`

**Purpose**: Manage category CRUD operations (custom categories only; predefined are constants).

### State Shape

```typescript
interface CategoryStore {
  // Readable state
  categories: Readable<Category[]>;      // Active categories (predefined + custom)
  customCategories: Readable<Category[]>; // Active custom categories only
  allCategories: Readable<Category[]>;   // Includes soft-deleted custom
  isLoading: Readable<boolean>;
  error: Readable<string | null>;

  // Methods
  create: (data: CreateCategoryInput) => Promise<Category>;
  update: (id: string, data: UpdateCategoryInput) => Promise<Category>;
  softDelete: (id: string) => Promise<void>;
  getById: (id: string) => Category | undefined;
  isPredefined: (id: string) => boolean;
}
```

### Input Types

```typescript
interface CreateCategoryInput {
  name: string;                 // Unique among active categories
}

interface UpdateCategoryInput {
  name?: string;                // Must remain unique among active categories
}
```

### Methods

#### `create(data: CreateCategoryInput): Promise<Category>`

**Purpose**: Create a custom category (FR-005)

**Validation**:
- `name` is required, 1-50 characters
- `name` must be unique among active categories (both predefined and custom)

**Side Effects**:
- Generates UUID for `id`
- Sets `type` to 'custom'
- Sets `createdAt` to current timestamp
- Sets `deletedAt` to null
- Persists to LocalStorage

**Returns**: Created category object

**Throws**: `ValidationError` if name is duplicate or invalid

---

#### `update(id: string, data: UpdateCategoryInput): Promise<Category>`

**Purpose**: Update custom category name

**Validation**:
- Category with `id` must exist, be custom type, and be active
- Cannot update predefined categories (FR-004)
- If `name` provided, must be unique among active categories

**Side Effects**:
- Persists to LocalStorage

**Returns**: Updated category object

**Throws**: `NotFoundError`, `ValidationError`, `ForbiddenError` (if predefined)

---

#### `softDelete(id: string): Promise<void>`

**Purpose**: Soft delete a custom category (FR-025)

**Validation**:
- Category with `id` must exist, be custom type, and be active
- Cannot delete predefined categories (FR-004)

**Behavior** (from clarifications):
- Sets `deletedAt` to current timestamp
- Category hidden from selection lists but data preserved
- All linked transactions remain accessible
- Category excluded from:
  - Category selection dropdowns (FR-026)
  - Category summary views (FR-026)

**Side Effects**:
- Persists to LocalStorage

**Returns**: void

**Throws**: `NotFoundError`, `ForbiddenError` (if predefined)

---

#### `getById(id: string): Category | undefined`

**Purpose**: Retrieve category by ID (includes soft-deleted for transaction history display)

**Returns**: Category object or undefined

---

#### `isPredefined(id: string): boolean`

**Purpose**: Check if a category is predefined

**Returns**: true if category.type === 'predefined', false otherwise

---

### Predefined Categories (Constants)

**Source**: `src/lib/models/category.ts`

```typescript
export const PREDEFINED_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food', type: 'predefined', createdAt: new Date('2025-01-01'), deletedAt: null },
  { id: 'cat-transport', name: 'Transport', type: 'predefined', createdAt: new Date('2025-01-01'), deletedAt: null },
  { id: 'cat-salary', name: 'Salary', type: 'predefined', createdAt: new Date('2025-01-01'), deletedAt: null },
  { id: 'cat-entertainment', name: 'Entertainment', type: 'predefined', createdAt: new Date('2025-01-01'), deletedAt: null },
  { id: 'cat-utilities', name: 'Utilities', type: 'predefined', createdAt: new Date('2025-01-01'), deletedAt: null },
  { id: 'cat-healthcare', name: 'Healthcare', type: 'predefined', createdAt: new Date('2025-01-01'), deletedAt: null },
  { id: 'cat-other', name: 'Other', type: 'predefined', createdAt: new Date('2025-01-01'), deletedAt: null }
];
```

**Note**: Predefined categories are merged with custom categories in the `categories` readable store.

---

## Analytics Store

**File**: `src/lib/stores/analytics.ts`

**Purpose**: Derived store for dashboard analytics and summaries.

### State Shape

```typescript
interface AnalyticsStore {
  // Derived state (all Readable)
  currentMonthSummary: Readable<MonthSummary>;
  categorySummary: Readable<CategorySummary[]>;
  monthlyTrends: Readable<MonthlyTrend[]>;
  savingsRate: Readable<number>;
}
```

### Types

```typescript
interface MonthSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  transactionCount: number;
  startDate: Date;
  endDate: Date;
}

interface CategorySummary {
  categoryId: string;
  categoryName: string;
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
  percentage: number;           // % of total expenses
}

interface MonthlyTrend {
  month: string;                // YYYY-MM format
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;          // Percentage
}
```

### Derived State

#### `currentMonthSummary: Readable<MonthSummary>`

**Purpose**: Summary of current month's financial activity (FR-007)

**Calculation**:
- Filters transactions for current calendar month
- Sums income, expenses, calculates net savings

**Updates**: Automatically recalculates when transactions change

---

#### `categorySummary: Readable<CategorySummary[]>`

**Purpose**: Spending breakdown by category for current month (FR-015)

**Calculation**:
- Groups transactions by category
- Calculates totals and percentage of total expenses
- Sorts by totalExpenses descending
- Excludes soft-deleted categories (FR-026)

**Updates**: Automatically recalculates when transactions or categories change

---

#### `monthlyTrends: Readable<MonthlyTrend[]>`

**Purpose**: Month-over-month financial trends for last 12 months (FR-017)

**Calculation**:
- Groups transactions by month (last 12 months)
- Calculates income, expenses, savings, and savings rate per month
- Sorts chronologically (oldest to newest)

**Updates**: Automatically recalculates when transactions change

---

#### `savingsRate: Readable<number>`

**Purpose**: Current month savings rate percentage (FR-016)

**Calculation**:
```typescript
savingsRate = (netSavings / totalIncome) * 100
```

**Returns**: 0 if totalIncome is 0

**Updates**: Automatically recalculates when current month summary changes

---

## Error Types

**File**: `src/lib/models/errors.ts`

```typescript
class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(
    message: string,
    public entityType: string,
    public entityId: string
  ) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}
```

---

## Store Implementation Pattern

All stores follow this pattern:

```typescript
import { writable, derived, get, type Readable } from 'svelte/store';
import { storageService } from '$lib/services/storage';

function createTransactionStore() {
  // Internal writable store
  const { subscribe, set, update } = writable<Transaction[]>([]);

  // Load from storage on init
  const loadFromStorage = async () => {
    const data = await storageService.getTransactions();
    set(data);
  };

  // Public API
  return {
    subscribe, // Make readable
    create: async (data: CreateTransactionInput) => {
      // Validation
      // Generate ID, timestamps
      // Update store
      // Persist to storage
      // Return created entity
    },
    // ... other methods
  };
}

export const transactions = createTransactionStore();
```

---

## Performance Optimizations

### Caching

Stores maintain internal caches for expensive calculations:
- Wallet balances (updated only when relevant transactions change)
- Category summaries (updated only when relevant transactions change)
- Monthly trends (updated only when transactions change)

### Debouncing

LocalStorage writes are debounced to avoid excessive I/O during rapid changes (e.g., bulk import).

### Indexing

Stores build in-memory indexes for fast lookups:
- Transactions by date
- Transactions by wallet
- Transactions by category

### Lazy Loading

Dashboard analytics calculated on-demand (not on every transaction change):
- Use derived stores to calculate only when subscribed
- Cache results until dependencies change

---

## Testing Contracts

Each store should have:
- Unit tests for all methods (create, update, delete, queries)
- Unit tests for validation logic
- Integration tests with storage service
- Performance tests (e.g., create 10k transactions, ensure queries remain fast)

**Target Coverage**: 80%+ per constitution

---

## Summary

Svelte stores serve as the "API contract" for this local-only application:
- ✅ Transactions: Full CRUD + filtering (FR-002, FR-010, FR-011, FR-012)
- ✅ Wallets: CRUD + soft delete + balance calculations (FR-001, FR-006, FR-021, FR-022, FR-027)
- ✅ Categories: Custom CRUD + soft delete (FR-004, FR-005, FR-025, FR-026)
- ✅ Analytics: Derived summaries + trends (FR-007, FR-015, FR-016, FR-017)
- ✅ Validation: Zod schemas + error handling (FR-018, FR-019, FR-023, FR-024)
- ✅ Performance: Caching, indexing, lazy loading (SC-001, SC-011)

All stores follow consistent patterns for testability and maintainability.
