# Tasks: Mobile Contrast Fix (004)

**Input**: `specs/004-mobile-contrast-fix/plan.md`, `data-model.md`, `research.md`
**Branch**: `004-mobile-contrast-fix`
**Stack**: SvelteKit 2.x + Tailwind CSS v4 + Skeleton UI (modern theme)

**Strategy**: Add explicit Tailwind text-color classes directly on each element.
This is more reliable than global CSS rules because Tailwind utilities are
unambiguous in cascade and survive any future theme or Skeleton updates.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup — COMPLETE

- [x] T001 Create branch `004-mobile-contrast-fix` from `main`
- [x] T002 Add `@custom-variant dark (&:where(.dark, .dark *))` and global color rules to `frontend/src/app.css`

**Checkpoint**: Branch ready, global safety-net CSS in place.

---

## Phase 2: Foundational — COMPLETE

Global catch-all rules already applied in `frontend/src/app.css`:
- `h1–h6 { color: #111827 }`
- `label { color: #374151 }`
- `input, select, textarea { color: #111827; background-color: #ffffff }`
- `input::placeholder, textarea::placeholder { color: #6b7280; opacity: 1 }`

No additional foundational work needed.

---

## Phase 3: US1 — Categorías page contrast (CategoryForm)

**Goal**: All text in the Categorías form renders with correct contrast on iOS Safari dark mode.

**Independent test**: Open `/categories` on iPhone with dark mode ON → form title, label, and input are legible.

### Implementation

- [ ] T003 [US1] Add `text-gray-900` to `<h3>` at line 129 in `frontend/src/lib/components/categories/CategoryForm.svelte`
- [ ] T004 [US1] Add `text-gray-700` to `<label>` at line 135 in `frontend/src/lib/components/categories/CategoryForm.svelte`
- [ ] T005 [US1] Add `text-gray-900 bg-white` to `<input>` at line 138 in `frontend/src/lib/components/categories/CategoryForm.svelte`

**Checkpoint**: `/categories` form fully readable on iOS dark mode.

---

## Phase 4: US2 — Billeteras page contrast (WalletForm + WalletList inline edit)

**Goal**: All text in the Billeteras form and inline edit renders with correct contrast on iOS Safari dark mode.

**Independent test**: Open `/wallets` on iPhone with dark mode ON → form title, label, input, and inline edit input are legible.

### Implementation

- [ ] T006 [US2] Add `text-gray-900` to `<h3>` at line 96 in `frontend/src/lib/components/wallets/WalletForm.svelte`
- [ ] T007 [US2] Add `text-gray-700` to `<label>` at line 100 in `frontend/src/lib/components/wallets/WalletForm.svelte`
- [ ] T008 [US2] Add `text-gray-900 bg-white` to `<input>` at line 103 in `frontend/src/lib/components/wallets/WalletForm.svelte`
- [ ] T009 [US2] Add `text-gray-900 bg-white` to inline edit `<input>` at line 95 in `frontend/src/lib/components/wallets/WalletList.svelte`

**Checkpoint**: `/wallets` page fully readable on iOS dark mode.

---

## Phase 5: US3 — Transacciones page contrast (TransactionList + TransactionFilters)

**Goal**: Transaction list title and all filter inputs/selects render with correct contrast on iOS Safari dark mode.

**Independent test**: Open `/transactions` on iPhone with dark mode ON → list heading, expand filters → all filter selects/inputs are legible.

### Implementation

- [ ] T010 [US3] Add `text-gray-900` to `<h2>` at line 64 in `frontend/src/lib/components/transactions/TransactionList.svelte`
- [ ] T011 [P] [US3] Add `text-gray-900 bg-white` to wallet `<select>` at line 118 in `frontend/src/lib/components/transactions/TransactionFilters.svelte`
- [ ] T012 [P] [US3] Add `text-gray-900 bg-white` to category `<select>` at line 135 in `frontend/src/lib/components/transactions/TransactionFilters.svelte`
- [ ] T013 [P] [US3] Add `text-gray-900 bg-white` to type `<select>` at line 152 in `frontend/src/lib/components/transactions/TransactionFilters.svelte`
- [ ] T014 [P] [US3] Add `text-gray-900 bg-white` to start date `<input>` at line 168 in `frontend/src/lib/components/transactions/TransactionFilters.svelte`
- [ ] T015 [P] [US3] Add `text-gray-900 bg-white` to end date `<input>` at line 181 in `frontend/src/lib/components/transactions/TransactionFilters.svelte`
- [ ] T016 [P] [US3] Add `text-gray-900 bg-white` to search `<input>` at line 194 in `frontend/src/lib/components/transactions/TransactionFilters.svelte`

**Checkpoint**: `/transactions` page and filters fully readable on iOS dark mode.

---

## Phase 6: Polish & Release

- [ ] T017 Verify desktop appearance unchanged (no visual regressions on Chrome/Firefox desktop)
- [ ] T018 Commit all changes on `004-mobile-contrast-fix` with message `fix(004): add explicit text colors to all form elements for iOS dark mode contrast`
- [ ] T019 Merge `004-mobile-contrast-fix` into `main` and push to GitHub (`git push origin main`)
- [ ] T020 Verify Vercel auto-deploys and test on iPhone with dark mode ON

**Checkpoint**: Fix live in production, WCAG AA contrast verified on iOS.

---

## Dependencies & Execution Order

- **Phase 1–2**: COMPLETE — no action needed
- **Phase 3–5**: Independent of each other — can be done in any order or in parallel
- **Phase 6**: Must be last

### Parallel Opportunities

T011–T016 (TransactionFilters) can all be done in one pass since they're in the same file.
T003–T005 (CategoryForm), T006–T009 (WalletForm), T010–T016 (Transactions) are independent groups.

---

## Implementation Strategy

### MVP (minimum to unblock user)

1. T003–T005: CategoryForm (highest reported impact)
2. T006–T009: WalletForm
3. T010–T016: Transactions
4. T017–T020: Commit + deploy

### Exact class additions per element

| Task | File | Line | Element | Add to `class=` |
|------|------|------|---------|----------------|
| T003 | CategoryForm.svelte | 129 | `<h3>` | `text-gray-900` |
| T004 | CategoryForm.svelte | 135 | `<label>` | `text-gray-700` |
| T005 | CategoryForm.svelte | 138 | `<input>` | `text-gray-900 bg-white` |
| T006 | WalletForm.svelte | 96 | `<h3>` | `text-gray-900` |
| T007 | WalletForm.svelte | 100 | `<label>` | `text-gray-700` |
| T008 | WalletForm.svelte | 103 | `<input>` | `text-gray-900 bg-white` |
| T009 | WalletList.svelte | 95 | `<input>` (inline edit) | `text-gray-900 bg-white` |
| T010 | TransactionList.svelte | 64 | `<h2>` | `text-gray-900` |
| T011 | TransactionFilters.svelte | 118 | `<select>` wallet | `text-gray-900 bg-white` |
| T012 | TransactionFilters.svelte | 135 | `<select>` category | `text-gray-900 bg-white` |
| T013 | TransactionFilters.svelte | 152 | `<select>` type | `text-gray-900 bg-white` |
| T014 | TransactionFilters.svelte | 168 | `<input>` start date | `text-gray-900 bg-white` |
| T015 | TransactionFilters.svelte | 181 | `<input>` end date | `text-gray-900 bg-white` |
| T016 | TransactionFilters.svelte | 194 | `<input>` search | `text-gray-900 bg-white` |
