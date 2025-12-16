# Research & Technology Decisions

**Feature**: Personal Finance Tracker
**Date**: 2025-10-19
**Status**: Completed

## Overview

This document captures the technology research and architectural decisions for the Personal Finance Tracker MVP. All decisions prioritize offline-first functionality, fast user interactions, and simple local-only data persistence.

---

## Technology Stack Decisions

### 1. Frontend Framework: Svelte + SvelteKit

**Decision**: Use Svelte 4.x with SvelteKit 2.x

**Rationale**:
- **Performance**: Svelte compiles to vanilla JavaScript with no runtime overhead, ideal for <2s load times
- **Reactivity**: Built-in reactive stores perfect for real-time balance calculations and dashboard updates
- **Developer Experience**: Minimal boilerplate, intuitive syntax for rapid MVP development
- **SvelteKit**: Provides file-based routing, build optimization, and SSG/SPA modes
- **Offline-First**: SvelteKit's static adapter enables fully client-side application with service worker support

**Alternatives Considered**:
- **React**: More verbose, requires additional state management libraries (Redux/Zustand), larger bundle size
- **Vue**: Similar capabilities but Svelte has better performance characteristics for this use case
- **Vanilla JS**: Would require manual reactivity implementation, slower development

**Best Practices**:
- Use Svelte stores for global state (transactions, wallets, categories)
- Leverage SvelteKit's `$lib` alias for clean imports
- Use TypeScript for type safety in stores and models
- Implement derived stores for computed values (balances, savings rate)

---

### 2. UI Component Library: Skeleton UI

**Decision**: Use @skeletonlabs/skeleton for UI components

**Rationale**:
- **Svelte-Native**: Built specifically for Svelte, not a wrapper around React components
- **Accessibility**: WCAG AA compliant components out of the box
- **Customization**: Tailwind CSS-based theming system
- **Design System**: Provides consistent patterns for forms, buttons, modals, tables
- **Performance**: Lightweight components optimized for Svelte's compilation

**Alternatives Considered**:
- **Tailwind UI**: Not Svelte-specific, requires custom component building
- **DaisyUI**: Tailwind plugin but not Svelte-optimized
- **Custom Components**: Would delay MVP delivery, inconsistent UX

**Best Practices**:
- Use Skeleton's AppShell for layout consistency
- Leverage Skeleton's form components for validation UX
- Use Skeleton's Modal for wallet/category management dialogs
- Implement Skeleton's Table component for transaction lists with filtering

---

### 3. Data Visualization: Layerchart

**Decision**: Use Layerchart for financial charts and graphs

**Rationale**:
- **Svelte-First**: Built for Svelte with reactive bindings
- **Performance**: Optimized for rendering large datasets (<2s dashboard target)
- **Flexibility**: Supports line charts (trends), pie charts (category breakdown), bar charts (monthly comparison)
- **D3 Integration**: Built on D3 for powerful data transformations
- **Responsive**: Charts adapt to screen sizes automatically

**Alternatives Considered**:
- **Chart.js**: Not Svelte-native, imperative API less suited for reactive data
- **D3 directly**: Steeper learning curve, more implementation time
- **Recharts**: React-only library

**Best Practices**:
- Use reactive stores to feed chart data automatically
- Implement lazy loading for dashboard charts (render on view)
- Cache aggregated chart data to meet <2s rendering target
- Use Layerchart's built-in tooltips for transaction details

---

### 4. Data Persistence: Browser LocalStorage

**Decision**: Use LocalStorage with JSON serialization for MVP

**Rationale**:
- **Offline-First**: Synchronous API, works completely offline
- **Simplicity**: No database setup, perfect for single-user MVP
- **Browser Support**: Universal support in target browsers (Chrome, Firefox, Safari, Edge)
- **Sufficient Capacity**: ~5-10MB supports 10,000+ transactions
- **No Backend**: Eliminates server costs and complexity for MVP

**Alternatives Considered**:
- **IndexedDB**: More complex API, overkill for structured JSON data at 10k scale
- **SessionStorage**: Clears on tab close, violates persistence requirement
- **Cloud Storage (Firebase, Supabase)**: Requires backend, internet, complicates offline-first

**Migration Path**:
- If scale exceeds 10k transactions, migrate to IndexedDB
- Abstract storage layer in `services/storage.ts` to enable easy swap

**Best Practices**:
- Create storage abstraction layer (`storage.ts`) for easy testing and future migration
- Implement versioning for data schema changes
- Use JSON schema validation on load to handle corrupted data
- Implement periodic localStorage health checks (quota monitoring)
- Lazy load transactions (pagination) to avoid loading 10k records at once

---

### 5. Testing Stack

**Decision**: Vitest (unit/integration) + Playwright (E2E) + @testing-library/svelte

**Rationale**:
- **Vitest**: Vite-native test runner, blazing fast, ESM support, Jest-compatible API
- **Playwright**: Cross-browser E2E testing (Chrome, Firefox, Safari), reliable selectors
- **@testing-library/svelte**: User-centric testing, encourages accessibility best practices
- **Constitution Compliance**: Supports 80%+ coverage target

**Alternatives Considered**:
- **Jest**: Slower than Vitest, requires additional ESM configuration
- **Cypress**: Heavier than Playwright, slower test execution
- **Manual Testing Only**: Doesn't meet constitution's comprehensive testing requirement

**Best Practices**:
- Unit test all stores (CRUD operations, balance calculations)
- Integration test store + storage layer interactions
- E2E test critical paths: transaction entry (<30s), dashboard rendering (<2s)
- Use Playwright's trace viewer for debugging failed tests
- Implement performance assertions in E2E tests (measure transaction entry time)

---

### 6. State Management Architecture

**Decision**: Svelte Stores with layered architecture

**Rationale**:
- **Native**: Svelte stores are first-class, no external library needed
- **Reactive**: Automatic UI updates when data changes (balances, summaries)
- **Performant**: Minimal overhead, perfect for real-time calculations
- **Testable**: Stores are pure functions, easy to unit test

**Architecture**:
```
┌─────────────────────────────────────┐
│  Svelte Components                  │
│  (Subscribe to stores)              │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  Svelte Stores                      │
│  - transactions.ts                  │
│  - wallets.ts                       │
│  - categories.ts                    │
│  - analytics.ts (derived)           │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  Services Layer                     │
│  - storage.ts (LocalStorage)        │
│  - validation.ts                    │
│  - calculations.ts                  │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  Browser LocalStorage               │
│  (JSON persistence)                 │
└─────────────────────────────────────┘
```

**Best Practices**:
- Keep stores focused (single responsibility)
- Use derived stores for computed values (avoid recalculation)
- Implement store subscriptions in components using `$` auto-subscription
- Use custom stores for complex state management (e.g., `transactionStore.createTransaction()`)

---

### 7. Validation Strategy

**Decision**: Client-side validation with zod schema validation

**Rationale**:
- **Type Safety**: Zod provides runtime type validation + TypeScript inference
- **Reusable**: Single schema definition for both validation and types
- **User Feedback**: Detailed error messages for validation failures (FR-019)
- **Performance**: Synchronous validation, no network latency

**Validation Rules** (from spec):
- Transaction amount: Not zero (FR-023), allow negative (FR-024)
- Wallet name: Unique among active wallets (FR-027)
- Required fields: date, amount, type, category, wallet (FR-018)
- Date: Allow past and present, handle future dates as edge case

**Best Practices**:
- Define zod schemas in `models/` alongside TypeScript types
- Validate at store level before persistence
- Provide real-time validation feedback in forms
- Log validation errors for debugging (not shown to user)

---

### 8. Internationalization (i18n)

**Decision**: svelte-i18n for Spanish/English support

**Rationale**:
- **Requirement**: Spec assumes Spanish or English language support
- **Svelte Integration**: First-class Svelte library with reactive translations
- **Lightweight**: Minimal bundle size increase
- **Currency/Date Formatting**: Handles locale-specific formatting (FR-020)

**Best Practices**:
- Store locale preference in LocalStorage
- Default to browser language (`navigator.language`)
- Use svelte-i18n's `$t()` helper for reactive translations
- Implement currency formatting with locale-aware `Intl.NumberFormat`

---

### 9. Soft Delete Implementation

**Decision**: Add `deletedAt` timestamp field to entities, filter in queries

**Rationale**:
- **Data Integrity**: Preserves historical data per clarifications (wallets, categories)
- **Audit Trail**: Track when items were deleted
- **Simple**: Minimal code complexity, just add field + filter logic
- **Recoverable**: Could add "restore" feature in future

**Implementation**:
```typescript
interface Wallet {
  id: string;
  name: string;
  createdAt: Date;
  deletedAt: Date | null; // null = active, date = soft-deleted
}

// Query active wallets
const activeWallets = wallets.filter(w => w.deletedAt === null);
```

**Best Practices**:
- Always filter by `deletedAt === null` for active records
- Exclude deleted items from selection dropdowns (FR-022, FR-026)
- Include deleted items in historical views (transaction list with deleted wallet)
- Never hard-delete data in MVP (data preservation priority)

---

### 10. Performance Optimization Strategies

**Decision**: Multiple strategies to meet <30s transaction entry and <2s dashboard

**Strategies**:

**Transaction Entry (<30s target)**:
- Pre-load dropdown options (wallets, categories) on app load
- Use native form elements (fast browser rendering)
- Debounce amount formatting (avoid excessive re-renders)
- Optimistic UI updates (save to LocalStorage asynchronously)

**Dashboard Rendering (<2s target)**:
- Lazy load chart components (code splitting)
- Pre-calculate aggregations on transaction create/update/delete
- Cache derived values in `analytics` store
- Use virtual scrolling for transaction list (if >100 items visible)
- Limit initial dashboard to current month (provide "load more" for history)

**LocalStorage Performance**:
- Batch writes (debounce saves during rapid edits)
- Index transactions by date in memory for fast filtering
- Lazy deserialize: only parse transactions when needed, not all 10k at once

**Best Practices**:
- Use Vite's code splitting for routes (lazy load wallets/categories pages)
- Implement performance monitoring in E2E tests
- Use browser DevTools Performance profiler during development
- Set performance budgets in Vite config

---

## Architecture Decisions

### AD-001: No Backend for MVP

**Context**: Spec explicitly excludes bank integrations and external APIs

**Decision**: Build client-side-only application with no backend server

**Consequences**:
- ✅ Faster MVP delivery (no API development)
- ✅ Zero hosting costs (static site hosting)
- ✅ Perfect offline capability
- ✅ Simpler security model (no auth needed)
- ⚠️ No cross-device sync (accepted limitation)
- ⚠️ No data backup/recovery (user responsible)

**Migration Path**: If future requirements need backend (sync, backup), add SvelteKit API routes + database

---

### AD-002: LocalStorage Over IndexedDB

**Context**: Need offline persistence for 10,000 transactions

**Decision**: Use LocalStorage for MVP, design for easy IndexedDB migration

**Consequences**:
- ✅ Simpler implementation (synchronous API)
- ✅ Sufficient for 10k transactions (~5MB JSON)
- ✅ Universal browser support
- ⚠️ Synchronous API could block UI with large datasets (mitigated by lazy loading)
- ⚠️ Quota limits (5-10MB) could be hit with heavy usage

**Migration Path**: Abstract storage layer allows swap to IndexedDB if quota issues arise

---

### AD-003: No User Authentication

**Context**: Single-user, local-only MVP

**Decision**: No login/signup, data stored directly in browser

**Consequences**:
- ✅ Faster development (no auth flow)
- ✅ Better UX (no login friction)
- ✅ Simpler security (browser sandbox sufficient)
- ⚠️ Data lost if browser cache cleared (document in user guide)
- ⚠️ No multi-user support (accepted limitation)

**Migration Path**: Add authentication if multi-user or cloud sync required

---

### AD-004: Predefined Categories as Constants

**Context**: Spec defines 7 predefined categories: food, transport, salary, entertainment, utilities, healthcare, other

**Decision**: Store predefined categories as code constants, custom categories in LocalStorage

**Consequences**:
- ✅ Predefined categories always available (can't be deleted per FR-004)
- ✅ Simpler query logic (no need to seed database)
- ✅ Easy to add more predefined categories in future
- ⚠️ Requires code deploy to add predefined categories (acceptable for MVP)

**Implementation**:
```typescript
const PREDEFINED_CATEGORIES = [
  { id: 'cat-food', name: 'Food', type: 'predefined' },
  { id: 'cat-transport', name: 'Transport', type: 'predefined' },
  // ... etc
];
```

---

## Open Questions & Future Research

### Resolved
None remaining - all technical decisions finalized.

### Deferred to Implementation
- **Currency Selection**: Default currency based on browser locale, allow manual override in settings (future enhancement)
- **Data Export**: CSV export deferred to post-MVP (out of scope per spec)
- **Service Worker**: PWA capabilities for install prompt (nice-to-have, not required for MVP)

---

## Dependencies & Versions

**Production**:
```json
{
  "svelte": "^4.2.0",
  "@sveltejs/kit": "^2.0.0",
  "@skeletonlabs/skeleton": "^2.5.0",
  "layerchart": "^0.30.0",
  "svelte-i18n": "^4.0.0",
  "zod": "^3.22.0"
}
```

**Development**:
```json
{
  "@sveltejs/adapter-static": "^3.0.0",
  "@testing-library/svelte": "^4.0.0",
  "@playwright/test": "^1.40.0",
  "vitest": "^1.0.0",
  "typescript": "^5.3.0",
  "tailwindcss": "^3.4.0",
  "eslint": "^8.55.0",
  "prettier": "^3.1.0"
}
```

---

## Summary

All technology decisions support the core requirements:
- ✅ Offline-first (LocalStorage + SvelteKit static adapter)
- ✅ Fast transaction entry (Svelte reactivity + optimistic UI)
- ✅ Fast dashboard (<2s with lazy loading + caching)
- ✅ Accessible UI (Skeleton components WCAG AA)
- ✅ Testable (Vitest + Playwright + 80% coverage)
- ✅ Maintainable (TypeScript + modular architecture)

No NEEDS CLARIFICATION items remaining. Ready for Phase 1 design.
