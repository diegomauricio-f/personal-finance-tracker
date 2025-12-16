# Tasks: Personal Finance Tracker

**Input**: Design documents from `/specs/001-personal-finance-tracker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/stores.md, quickstart.md
**Generated**: 2025-10-22

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Project structure: `src/lib/` for shared code, `src/routes/` for pages (SvelteKit convention)
- Tests: `tests/unit/`, `tests/integration/`, `tests/e2e/`
- Specs: `specs/001-personal-finance-tracker/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per quickstart.md and research.md

- [ ] T001 Initialize SvelteKit project with TypeScript using `npm create svelte@latest` (see quickstart.md lines 27-38)
- [ ] T002 Install core dependencies: @sveltejs/kit, svelte, typescript (see research.md lines 383-406)
- [ ] T003 [P] Install UI dependencies: @skeletonlabs/skeleton, tailwindcss, layerchart, date-fns, clsx, zod (see plan.md lines 16-22)
- [ ] T004 [P] Install testing dependencies: vitest, @testing-library/svelte, @playwright/test (see research.md lines 117-136)
- [ ] T005 [P] Configure Tailwind CSS for Skeleton UI theming (see research.md lines 40-60)
- [ ] T006 [P] Configure ESLint with constitution rules: max cyclomatic complexity 15, max method length 30, max file size 300 (see plan.md lines 98-103)
- [ ] T007 [P] Configure Prettier for code formatting (see quickstart.md line 183)
- [ ] T008 [P] Configure TypeScript with strict mode in tsconfig.json (see quickstart.md line 189)
- [ ] T009 [P] Set up Vite config with @sveltejs/adapter-static for SPA mode (see quickstart.md lines 476-492)
- [ ] T010 Configure Playwright for E2E testing with mobile viewport support (see quickstart.md lines 155-168, plan.md lines 30-33)

**Checkpoint**: Development environment ready - can run `npm run dev` successfully

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented. Includes offline-first data persistence (User Story 5).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Models & Validation (see data-model.md, plan.md lines 173-177)

- [ ] T011 [P] Create TypeScript interface for Transaction in src/lib/models/transaction.ts (see data-model.md lines 19-31)
- [ ] T012 [P] Create TypeScript interface for Wallet in src/lib/models/wallet.ts (see data-model.md lines 68-76)
- [ ] T013 [P] Create TypeScript interface for Category in src/lib/models/category.ts (see data-model.md lines 120-128)
- [ ] T014 [P] Create error classes in src/lib/models/errors.ts: ValidationError, NotFoundError, ForbiddenError, StorageError (see contracts/stores.md lines 575-613)
- [ ] T015 [P] Define PREDEFINED_CATEGORIES constant in src/lib/models/category.ts with 7 categories: food, transport, salary, entertainment, utilities, healthcare, other (see data-model.md lines 276-331)
- [ ] T016 [P] Create Zod schema for Transaction validation in src/lib/models/transaction.ts (see data-model.md lines 514-531)
- [ ] T017 [P] Create Zod schema for Wallet validation in src/lib/models/wallet.ts (see data-model.md lines 534-541)
- [ ] T018 [P] Create Zod schema for Category validation in src/lib/models/category.ts (see data-model.md lines 543-552)

### Utilities (see plan.md lines 178-182)

- [ ] T019 [P] Create UUID generation utility using crypto.randomUUID() in src/lib/utils/uuid.ts
- [ ] T020 [P] Create date utility functions using date-fns in src/lib/utils/dates.ts: formatDate, parseDate, isWithinRange
- [ ] T021 [P] Create currency formatting utility using Intl.NumberFormat in src/lib/utils/currency.ts (see research.md lines 219-225)

### Storage Service (Offline-First - User Story 5 infrastructure)

- [ ] T022 Create LocalStorage abstraction service in src/lib/services/storage.ts with methods: saveTransactions, getTransactions, saveWallets, getWallets, saveCategories, getCategories (see research.md lines 86-113, data-model.md lines 224-271)
- [ ] T023 Add schema versioning to storage service with migration support (see data-model.md lines 447-477, quickstart.md lines 517-523)
- [ ] T024 Add error handling for LocalStorage quota exceeded in storage service (see research.md lines 107-112, quickstart.md lines 548-556)
- [ ] T025 Add data serialization/deserialization with Date handling in storage service (see data-model.md lines 236-271)

**Checkpoint**: Foundation ready - models, schemas, utilities, and storage service complete. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Quick Transaction Entry (Priority: P1) 🎯 MVP

**Goal**: Enable users to record transactions in under 30 seconds with date, amount, type, category, and wallet

**Independent Test**: Create a transaction with all required fields and verify it saves within 30 seconds, appears in transaction list, and persists after page refresh

**References**: spec.md lines 20-34, plan.md lines 34-38, contracts/stores.md lines 13-178

### Core Stores (Dependencies for transaction entry)

- [ ] T026 [P] [US1] Create Wallet store in src/lib/stores/wallets.ts with create, getById, getBalance methods (see contracts/stores.md lines 180-327)
- [ ] T027 [P] [US1] Create Category store in src/lib/stores/categories.ts with getById, isPredefined methods and merge PREDEFINED_CATEGORIES (see contracts/stores.md lines 330-467)
- [ ] T028 [US1] Create Transaction store in src/lib/stores/transactions.ts with create, getById, filter methods (see contracts/stores.md lines 13-178)
- [ ] T029 [US1] Connect Transaction store to storage service for persistence (see contracts/stores.md lines 622-650)
- [ ] T030 [US1] Implement balance calculation in Wallet store using transactions (see data-model.md lines 337-355)

### Transaction Entry UI

- [ ] T031 [P] [US1] Create TransactionForm component in src/lib/components/transactions/TransactionForm.svelte with fields: date (default today), amount, type, category dropdown, wallet dropdown, note (see spec.md lines 29-34)
- [ ] T032 [US1] Add amount validation: reject zero, allow negative, provide clear error messages (see spec.md lines 106-107, data-model.md lines 34-37)
- [ ] T033 [US1] Add required field validation with error display (see spec.md line 143)
- [ ] T034 [US1] Implement optimistic UI updates for fast save feedback (see research.md lines 262-270)
- [ ] T035 [US1] Create transaction entry page in src/routes/transactions/new/+page.svelte using TransactionForm component (see plan.md lines 184-193)

### Transaction List View

- [ ] T036 [P] [US1] Create TransactionList component in src/lib/components/transactions/TransactionList.svelte showing date, amount, type, category, wallet (see spec.md line 31)
- [ ] T037 [US1] Add transaction list page in src/routes/transactions/+page.svelte (see plan.md lines 184-193)

**Checkpoint**: At this point, User Story 1 (MVP) should be fully functional - users can create transactions in <30s, see them in the list, and data persists offline. Test by disconnecting internet and verifying transactions save and reload.

---

## Phase 4: User Story 2 - Multi-Wallet Management (Priority: P2)

**Goal**: Enable users to organize money across different wallets (cash, bank, PayPal) and see fund distribution

**Independent Test**: Create multiple wallets, assign transactions to different wallets, view balance summaries per wallet

**References**: spec.md lines 36-51, plan.md lines 154-162, contracts/stores.md lines 180-327

### Wallet CRUD Operations

- [ ] T038 [US2] Add update method to Wallet store for renaming wallets (see contracts/stores.md lines 241-257)
- [ ] T039 [US2] Add softDelete method to Wallet store with deletedAt timestamp (see contracts/stores.md lines 259-283, data-model.md lines 92-113)
- [ ] T040 [US2] Implement unique wallet name validation (case-sensitive) in Wallet store (see spec.md lines 113-114, data-model.md lines 79-84)
- [ ] T041 [US2] Filter soft-deleted wallets from selection dropdowns (see spec.md line 109, contracts/stores.md lines 270-277)

### Wallet Management UI

- [ ] T042 [P] [US2] Create WalletList component in src/lib/components/wallets/WalletList.svelte showing name, balance, transaction count (see spec.md lines 48-49)
- [ ] T043 [P] [US2] Create WalletForm component in src/lib/components/wallets/WalletForm.svelte for create/edit with name validation
- [ ] T044 [US2] Create wallet management page in src/routes/wallets/+page.svelte with list and form (see plan.md lines 189-191)
- [ ] T045 [US2] Add total balance display using derived totalBalance store (see contracts/stores.md lines 313-327, data-model.md lines 356-369)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can manage multiple wallets and see fund distribution

---

## Phase 5: User Story 3 - Expense Categorization (Priority: P2)

**Goal**: Enable users to categorize transactions and identify spending patterns by category

**Independent Test**: Categorize transactions using predefined and custom categories, view spending summary by category

**References**: spec.md lines 53-68, plan.md lines 163-166, contracts/stores.md lines 330-467

### Category CRUD Operations

- [ ] T046 [US3] Add create method to Category store for custom categories with unique name validation (see contracts/stores.md lines 370-388)
- [ ] T047 [US3] Add update method to Category store for renaming custom categories (see contracts/stores.md lines 390-407)
- [ ] T048 [US3] Add softDelete method to Category store (custom only, block predefined) (see contracts/stores.md lines 409-431, data-model.md lines 144-175)
- [ ] T049 [US3] Filter soft-deleted categories from selection dropdowns (see spec.md line 127, contracts/stores.md lines 419-424)

### Category Management UI & Summary

- [ ] T050 [P] [US3] Create CategoryForm component in src/lib/components/categories/CategoryForm.svelte for custom category create/edit
- [ ] T051 [P] [US3] Create CategoryList component in src/lib/components/categories/CategoryList.svelte showing predefined (read-only) and custom (editable) categories
- [ ] T052 [US3] Create category management page in src/routes/categories/+page.svelte (see plan.md lines 191-193)
- [ ] T053 [US3] Add category summary calculation showing total income/expenses per category (see data-model.md lines 400-444)

**Checkpoint**: All basic user stories (1, 2, 3) should now be independently functional - users can manage wallets, categories, and transactions

---

## Phase 6: User Story 4 - Financial Insights Dashboard (Priority: P3)

**Goal**: Provide visual summaries of income, expenses, savings trends to help users achieve 10% savings improvement

**Independent Test**: Enter sample transactions over a period, view dashboard with income vs expenses, category breakdowns, savings rate, monthly trends - all rendering in <2s

**References**: spec.md lines 70-85, plan.md lines 167-172, contracts/stores.md lines 470-571

### Analytics Store (Derived Data)

- [ ] T054 [US4] Create Analytics store in src/lib/stores/analytics.ts as derived store from transactions (see contracts/stores.md lines 470-571)
- [ ] T055 [US4] Implement currentMonthSummary derived store: totalIncome, totalExpenses, netSavings (see contracts/stores.md lines 520-529, data-model.md lines 372-399)
- [ ] T056 [US4] Implement categorySummary derived store with percentage calculations (see contracts/stores.md lines 531-543)
- [ ] T057 [US4] Implement monthlyTrends derived store for last 12 months (see contracts/stores.md lines 545-557)
- [ ] T058 [US4] Implement savingsRate derived store as percentage (see contracts/stores.md lines 559-571, data-model.md lines 371-399)

### Dashboard UI Components

- [ ] T059 [P] [US4] Create MonthSummaryCard component in src/lib/components/dashboard/MonthSummaryCard.svelte displaying income, expenses, savings (see spec.md lines 81-82)
- [ ] T060 [P] [US4] Create CategoryBreakdown component using Layerchart pie chart in src/lib/components/dashboard/CategoryBreakdown.svelte (see research.md lines 63-84, spec.md line 84)
- [ ] T061 [P] [US4] Create MonthlyTrendsChart component using Layerchart line chart in src/lib/components/dashboard/MonthlyTrendsChart.svelte (see spec.md line 82)
- [ ] T062 [P] [US4] Create SavingsRateDisplay component in src/lib/components/dashboard/SavingsRateDisplay.svelte showing current vs 10% goal (see spec.md line 83)
- [ ] T063 [US4] Create dashboard page in src/routes/+page.svelte assembling all analytics components (see plan.md lines 183-185)
- [ ] T064 [US4] Implement lazy loading for chart components to meet <2s rendering target (see research.md lines 271-277)
- [ ] T065 [US4] Add caching for derived analytics to optimize dashboard performance (see research.md lines 278-282, contracts/stores.md lines 656-662)

**Checkpoint**: All user stories complete - full personal finance tracking app with insights

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements, testing, and mobile-first responsive design updates

### Responsive Design & Mobile-First (Constitution Update)

- [ ] T066 [P] Apply mobile-first responsive layouts using Tailwind breakpoints to all components (see plan.md lines 30-33)
- [ ] T067 [P] Ensure minimum 44x44px touch targets on all buttons and interactive elements (see constitution.md line 14)
- [ ] T068 [P] Test and optimize for <3s page load on 3G mobile networks (see plan.md line 37, constitution.md line 39)
- [ ] T069 [P] Verify <100ms UI response time on mobile devices for all interactions (see plan.md line 38, constitution.md line 44)

### Advanced Transaction Features

- [ ] T070 [US1] Add transaction edit functionality using TransactionForm with pre-filled values (see spec.md line 134)
- [ ] T071 [US1] Add transaction delete functionality with confirmation (see spec.md line 135)
- [ ] T072 [US1] Implement transaction filtering by wallet, category, date range, type (see spec.md line 133, contracts/stores.md lines 167-177)

### Testing (Optional - Constitution requires 80% coverage)

- [ ] T073 [P] Write unit tests for all stores (transactions, wallets, categories, analytics) in tests/unit/stores/ using Vitest (see quickstart.md lines 321-344)
- [ ] T074 [P] Write integration tests for store + storage service interactions in tests/integration/ (see quickstart.md lines 426-431)
- [ ] T075 [P] Write E2E test for transaction entry <30s performance in tests/e2e/transaction-entry.spec.ts using Playwright (see quickstart.md lines 346-361, spec.md line 124)
- [ ] T076 [P] Write E2E test for dashboard rendering <2s performance in tests/e2e/dashboard.spec.ts (see quickstart.md lines 433-447, spec.md line 171)
- [ ] T077 [P] Write E2E test for offline functionality in tests/e2e/offline-access.spec.ts (see spec.md lines 96-101)
- [ ] T078 Verify test coverage reaches 80% minimum (see plan.md lines 101-103)

### Documentation & Final Validation

- [ ] T079 [P] Add clsx for conditional CSS class management across all components (see plan.md line 21)
- [ ] T080 [P] Update README.md with quickstart instructions
- [ ] T081 Run all linting checks: `npm run lint` (see CLAUDE.md line 13)
- [ ] T082 Run all tests: `npm test` (see CLAUDE.md line 13)
- [ ] T083 Validate constitution compliance: code quality, testing, UX consistency, performance, security (see plan.md lines 49-130)
- [ ] T084 Build production bundle: `npm run build` and verify <2s load time (see quickstart.md lines 131-137)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion - MVP starting point
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion - Can run in parallel with US3
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion - Can run in parallel with US2
- **User Story 4 (Phase 6)**: Depends on US1, US2, US3 completion (needs transaction data to show insights)
- **Polish (Phase 7)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: ✅ MVP - Start here after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Integrates with US1 but independently testable
- **User Story 3 (P2)**: Can start after Foundational - Integrates with US1 but independently testable
- **User Story 4 (P3)**: Depends on US1, US2, US3 providing transaction data
- **User Story 5 (P1)**: Already implemented in Foundational phase (offline-first storage)

### Within Each User Story

- Models before stores
- Stores before components
- Components before pages
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 Setup**: T003, T004, T005, T006, T007, T008, T009, T010 can all run in parallel
- **Phase 2 Foundational**: T011-T021 can run in parallel (different files), T022-T025 sequential (same file)
- **Phase 3 US1**: T026, T027 parallel → T028 → T029, T030 parallel → T031, T036 parallel → rest
- **Phase 4 US2**: T042, T043 can run in parallel
- **Phase 5 US3**: T050, T051 can run in parallel
- **Phase 6 US4**: T059, T060, T061, T062 can run in parallel
- **Phase 7 Polish**: T066, T067, T068, T069, T073, T074, T075, T076, T077, T079, T080 can run in parallel

---

## Parallel Example: User Story 1 (MVP)

```bash
# Launch all stores for User Story 1 together:
Task: "[US1] Create Wallet store in src/lib/stores/wallets.ts"
Task: "[US1] Create Category store in src/lib/stores/categories.ts"

# Then launch UI components together:
Task: "[US1] Create TransactionForm component in src/lib/components/transactions/TransactionForm.svelte"
Task: "[US1] Create TransactionList component in src/lib/components/transactions/TransactionList.svelte"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only - Recommended)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T025) - CRITICAL - includes offline-first infrastructure
3. Complete Phase 3: User Story 1 (T026-T037) - Quick transaction entry
4. **STOP and VALIDATE**: Test transaction entry <30s, verify offline persistence
5. Deploy/demo if ready - you now have a working MVP!

### Incremental Delivery

1. Complete Setup + Foundational (T001-T025) → Foundation ready
2. Add User Story 1 (T026-T037) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (T038-T045) → Test independently → Multi-wallet support added
4. Add User Story 3 (T046-T053) → Test independently → Category management added
5. Add User Story 4 (T054-T065) → Test independently → Full analytics dashboard
6. Polish (T066-T084) → Production-ready with responsive design and tests

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T025)
2. Once Foundational is done:
   - Developer A: User Story 1 (T026-T037) - MVP
   - Developer B: User Story 2 (T038-T045) - Wallets
   - Developer C: User Story 3 (T046-T053) - Categories
3. Stories complete and integrate independently
4. Developer D: User Story 4 after US1-3 complete (T054-T065) - Dashboard

---

## Task Summary

- **Total Tasks**: 84
- **Setup**: 10 tasks
- **Foundational**: 15 tasks (includes US5 offline-first infrastructure)
- **User Story 1 (MVP)**: 12 tasks
- **User Story 2**: 8 tasks
- **User Story 3**: 8 tasks
- **User Story 4**: 12 tasks
- **Polish & Testing**: 19 tasks

**Parallel Opportunities**: 38 tasks marked [P] can run in parallel within their phase

**MVP Scope**: Tasks T001-T037 (47 tasks total for working MVP with transaction entry)

**Cross-References**:
- Technology decisions: research.md
- Entity definitions: data-model.md lines 13-176
- Store contracts: contracts/stores.md lines 13-705
- Performance targets: plan.md lines 34-38
- User stories: spec.md lines 18-103
- Constitution compliance: plan.md lines 49-130

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- File paths follow SvelteKit conventions: src/lib/ for shared code, src/routes/ for pages
- All performance targets from constitution included: <30s transaction, <2s dashboard, <3s mobile load, <100ms mobile UI
- Responsive design requirements from constitution update included in Polish phase
