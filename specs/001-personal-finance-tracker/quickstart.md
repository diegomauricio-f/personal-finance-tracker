# Quick Start Guide

**Feature**: Personal Finance Tracker
**Date**: 2025-10-19
**Stack**: Svelte + SvelteKit + TypeScript

## Overview

This guide provides instructions for setting up the development environment, running the application, and understanding the project structure for the Personal Finance Tracker MVP.

---

## Prerequisites

Ensure you have the following installed:

- **Node.js**: v18.x or v20.x (LTS recommended)
- **npm**: v9.x or higher (comes with Node.js)
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (last 2 versions)
- **Code Editor**: VS Code recommended (with Svelte extensions)

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd personal-finance-tracker
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- SvelteKit and Svelte
- Skeleton UI component library
- Layerchart for data visualization
- Vitest and Playwright for testing
- TypeScript and type definitions
- Development tools (ESLint, Prettier)

### 3. Verify Installation

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. You should see the application dashboard.

---

## Project Structure

```
personal-finance-tracker/
├── src/
│   ├── lib/                    # Reusable code
│   │   ├── components/         # Svelte components
│   │   │   ├── transactions/   # Transaction-related components
│   │   │   ├── wallets/        # Wallet-related components
│   │   │   ├── categories/     # Category-related components
│   │   │   ├── dashboard/      # Dashboard & charts
│   │   │   └── shared/         # Shared UI components
│   │   ├── stores/             # Svelte stores (state management)
│   │   │   ├── transactions.ts
│   │   │   ├── wallets.ts
│   │   │   ├── categories.ts
│   │   │   └── analytics.ts
│   │   ├── services/           # Business logic
│   │   │   ├── storage.ts      # LocalStorage abstraction
│   │   │   ├── validation.ts   # Validation logic
│   │   │   └── calculations.ts # Financial calculations
│   │   ├── models/             # TypeScript types/interfaces
│   │   │   ├── transaction.ts
│   │   │   ├── wallet.ts
│   │   │   ├── category.ts
│   │   │   └── errors.ts
│   │   └── utils/              # Utility functions
│   │       ├── currency.ts
│   │       ├── dates.ts
│   │       └── uuid.ts
│   ├── routes/                 # SvelteKit pages (file-based routing)
│   │   ├── +page.svelte        # Dashboard (home)
│   │   ├── transactions/
│   │   │   ├── +page.svelte    # Transaction list
│   │   │   └── new/
│   │   │       └── +page.svelte # New transaction form
│   │   ├── wallets/
│   │   │   └── +page.svelte    # Wallet management
│   │   └── categories/
│   │       └── +page.svelte    # Category management
│   └── app.html                # HTML template
├── static/                     # Static assets
├── tests/                      # Test files
│   ├── unit/                   # Vitest unit tests
│   ├── integration/            # Vitest integration tests
│   └── e2e/                    # Playwright E2E tests
├── specs/                      # Feature documentation
│   └── 001-personal-finance-tracker/
│       ├── spec.md             # Feature specification
│       ├── plan.md             # Implementation plan
│       ├── data-model.md       # Data model
│       ├── contracts/          # Store contracts
│       └── quickstart.md       # This file
├── package.json
├── vite.config.ts
├── svelte.config.js
├── playwright.config.ts
└── tsconfig.json
```

---

## Development Commands

### Run Development Server

```bash
npm run dev
```

Starts the development server at http://localhost:5173 with hot module replacement (HMR).

### Build for Production

```bash
npm run build
```

Creates an optimized production build in the `build/` directory.

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing before deployment.

### Run Unit Tests

```bash
npm run test:unit
```

Runs Vitest unit and integration tests with coverage reporting.

### Run E2E Tests

```bash
npm run test:e2e
```

Runs Playwright end-to-end tests in headless mode.

### Run E2E Tests (UI Mode)

```bash
npm run test:e2e:ui
```

Opens Playwright UI for interactive test debugging.

### Lint Code

```bash
npm run lint
```

Runs ESLint to check for code quality issues.

### Format Code

```bash
npm run format
```

Runs Prettier to format all code files.

### Type Check

```bash
npm run check
```

Runs TypeScript type checking without emitting files.

---

## Key Concepts

### 1. Svelte Stores (State Management)

The application uses Svelte stores for global state management. Stores are located in `src/lib/stores/`.

**Example: Using the transaction store**

```svelte
<script>
  import { transactions } from '$lib/stores/transactions';
  import { onMount } from 'svelte';

  // Subscribe to store (automatic with $ prefix)
  $: allTransactions = $transactions;

  // Create a new transaction
  async function addTransaction() {
    await transactions.create({
      date: new Date(),
      amount: 50.00,
      type: 'expense',
      categoryId: 'cat-food',
      walletId: 'wallet-001',
      note: 'Groceries'
    });
  }
</script>

<ul>
  {#each allTransactions as transaction}
    <li>{transaction.note}: {transaction.amount}</li>
  {/each}
</ul>

<button on:click={addTransaction}>Add Transaction</button>
```

### 2. File-Based Routing

SvelteKit uses file-based routing. Each `+page.svelte` file in `src/routes/` becomes a route:

- `src/routes/+page.svelte` → `/` (dashboard)
- `src/routes/transactions/+page.svelte` → `/transactions`
- `src/routes/transactions/new/+page.svelte` → `/transactions/new`

### 3. Component Composition

Components are organized by feature in `src/lib/components/`. Import them using the `$lib` alias:

```svelte
<script>
  import TransactionList from '$lib/components/transactions/TransactionList.svelte';
</script>

<TransactionList />
```

### 4. LocalStorage Persistence

All data is persisted to browser LocalStorage. The storage service (`src/lib/services/storage.ts`) provides an abstraction layer:

```typescript
import { storageService } from '$lib/services/storage';

// Save data
await storageService.saveTransactions(transactions);

// Load data
const transactions = await storageService.getTransactions();
```

**Storage Keys**:
- `finance-tracker:transactions`
- `finance-tracker:wallets`
- `finance-tracker:categories`
- `finance-tracker:settings`
- `finance-tracker:version`

### 5. Validation with Zod

All input validation uses Zod schemas defined in `src/lib/models/`:

```typescript
import { TransactionSchema } from '$lib/models/transaction';

// Validate input
const result = TransactionSchema.safeParse(input);
if (!result.success) {
  console.error(result.error);
}
```

---

## Common Development Tasks

### Adding a New Component

1. Create a new `.svelte` file in `src/lib/components/<feature>/`
2. Import and use in a page or parent component:

```svelte
<script>
  import MyComponent from '$lib/components/shared/MyComponent.svelte';
</script>

<MyComponent />
```

### Adding a New Store

1. Create a new file in `src/lib/stores/` (e.g., `myStore.ts`)
2. Follow the store pattern (see `contracts/stores.md`)
3. Export the store instance
4. Use in components with `$` auto-subscription

### Adding a New Route

1. Create a `+page.svelte` file in `src/routes/<path>/`
2. Add navigation link in layout or nav component
3. The route is automatically available

### Adding a Test

**Unit Test** (`tests/unit/stores/transactions.test.ts`):
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { transactions } from '$lib/stores/transactions';

describe('Transaction Store', () => {
  beforeEach(() => {
    // Reset store state
  });

  it('should create a transaction', async () => {
    const transaction = await transactions.create({
      date: new Date(),
      amount: 100,
      type: 'income',
      categoryId: 'cat-salary',
      walletId: 'wallet-001'
    });

    expect(transaction.id).toBeDefined();
    expect(transaction.amount).toBe(100);
  });
});
```

**E2E Test** (`tests/e2e/transaction-entry.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test('user can create a transaction', async ({ page }) => {
  await page.goto('/transactions/new');

  await page.fill('[name="amount"]', '50');
  await page.selectOption('[name="type"]', 'expense');
  await page.selectOption('[name="category"]', 'cat-food');
  await page.selectOption('[name="wallet"]', 'wallet-001');
  await page.click('button[type="submit"]');

  await expect(page.locator('.transaction-list')).toContainText('50');
});
```

---

## Debugging

### Browser DevTools

1. Open Chrome/Firefox DevTools (F12)
2. Check Console for errors
3. Use Network tab to monitor (none expected - offline app)
4. Use Application tab to inspect LocalStorage data

### Svelte DevTools Extension

Install the Svelte DevTools browser extension for:
- Component hierarchy inspection
- Store state visualization
- Event tracking

### Vite Inspector

While dev server is running, press `Shift + Alt + Click` on any element to jump to its source component in VS Code.

---

## Performance Monitoring

### Measure Transaction Entry Time (<30s target)

```javascript
console.time('transaction-entry');
await transactions.create({ /* ... */ });
console.timeEnd('transaction-entry');
```

### Measure Dashboard Rendering (<2s target)

Use Chrome DevTools Performance profiler:
1. Open DevTools → Performance tab
2. Click Record
3. Navigate to dashboard
4. Stop recording
5. Analyze rendering time

---

## Testing Strategy

### Unit Tests (Vitest)

**Coverage**: 80%+ (per constitution)

**Focus Areas**:
- Store methods (CRUD operations)
- Validation logic
- Calculation functions (balance, savings rate)
- Utility functions

**Run with coverage**:
```bash
npm run test:unit -- --coverage
```

### Integration Tests (Vitest)

**Focus Areas**:
- Store + storage service interactions
- Store + derived store calculations
- Multi-store workflows (e.g., create transaction → update wallet balance)

### E2E Tests (Playwright)

**Coverage**: Critical user journeys (from spec)

**Priority Scenarios**:
1. Transaction entry (<30s - measure performance)
2. Wallet management (create, edit, soft delete)
3. Category management (create custom, soft delete)
4. Dashboard rendering (<2s - measure performance)
5. Transaction filtering

**Run specific test**:
```bash
npm run test:e2e -- transaction-entry.spec.ts
```

---

## Deployment

### Static Hosting (Recommended)

Since this is a client-side-only app, deploy to any static hosting service:

**Vercel**:
```bash
npm install -g vercel
vercel
```

**Netlify**:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**GitHub Pages**:
```bash
npm run build
# Push build/ directory to gh-pages branch
```

### Build Configuration

The app uses `@sveltejs/adapter-static` for static site generation.

**Configuration** (`svelte.config.js`):
```javascript
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // SPA mode
      precompress: false
    })
  }
};
```

---

## Data Management

### Resetting Data (Development)

To clear all local data:

1. Open Browser DevTools → Application tab
2. Select Local Storage → http://localhost:5173
3. Click "Clear All"
4. Refresh page

**Or via console**:
```javascript
localStorage.clear();
location.reload();
```

### Exporting Data (Future Feature)

Currently out of scope per spec. Migration path: add CSV export button that downloads LocalStorage data.

### Data Schema Migrations

When updating data model:
1. Increment version in `finance-tracker:version`
2. Add migration function in `src/lib/services/storage.ts`
3. Run migration on app load if version mismatch

---

## Troubleshooting

### Issue: Application won't start

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: Tests failing

**Solution**:
```bash
# Clear test cache
npm run test:unit -- --clearCache

# Update Playwright browsers
npx playwright install
```

### Issue: LocalStorage quota exceeded

**Symptoms**: Errors when creating transactions, data not saving

**Solution**:
- Current limit: ~10k transactions (5-10MB)
- Short-term: Delete old transactions
- Long-term: Implement IndexedDB migration (see `research.md`)

### Issue: Performance degradation

**Symptoms**: Dashboard slow to render, transaction list laggy

**Solution**:
- Check transaction count (should be <10k for MVP)
- Implement pagination for transaction list
- Use browser Performance profiler to identify bottlenecks
- Consider implementing virtual scrolling

---

## Next Steps

1. **Review Spec**: Read `specs/001-personal-finance-tracker/spec.md` for requirements
2. **Review Plan**: Read `specs/001-personal-finance-tracker/plan.md` for architecture
3. **Review Data Model**: Read `specs/001-personal-finance-tracker/data-model.md` for entities
4. **Review Contracts**: Read `specs/001-personal-finance-tracker/contracts/stores.md` for store APIs
5. **Start Development**: Use `/speckit.implement` to generate implementation tasks

---

## Resources

**Documentation**:
- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Svelte Tutorial](https://learn.svelte.dev)
- [Skeleton UI Docs](https://www.skeleton.dev/docs/get-started)
- [Layerchart Docs](https://www.layerchart.com)
- [Vitest Docs](https://vitest.dev)
- [Playwright Docs](https://playwright.dev)

**Community**:
- [Svelte Discord](https://svelte.dev/chat)
- [SvelteKit GitHub Discussions](https://github.com/sveltejs/kit/discussions)

---

## Summary

You're now ready to start developing the Personal Finance Tracker MVP! The project is set up with:

- ✅ SvelteKit + TypeScript for type-safe development
- ✅ Skeleton UI for consistent, accessible components
- ✅ Layerchart for financial data visualization
- ✅ Vitest + Playwright for comprehensive testing (80%+ coverage target)
- ✅ LocalStorage for offline-first data persistence
- ✅ Clear project structure following SvelteKit conventions

**Performance Targets**:
- Transaction entry: <30 seconds
- Dashboard rendering: <2 seconds
- Initial page load: <2 seconds

**Next Command**: `/speckit.implement` to generate detailed implementation tasks

Happy coding! 🚀
