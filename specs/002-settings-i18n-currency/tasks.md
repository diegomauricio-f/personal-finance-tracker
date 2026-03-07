# Tasks: Application Language and Currency Settings

**Input**: Design documents from `/specs/002-settings-i18n-currency/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included - target 85% coverage (exceeds 80% constitution minimum)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Web app structure: `frontend/src/`, `frontend/tests/`
- Paths follow plan.md structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project structure and TypeScript type definitions

- [X] T001 [P] Create i18n directory structure at frontend/src/lib/i18n/
- [X] T002 [P] Create translations directory at frontend/src/lib/i18n/translations/
- [X] T003 [P] Create settings components directory at frontend/src/lib/components/settings/
- [X] T004 [P] Create settings route directory at frontend/src/routes/settings/
- [X] T005 [P] Create test directories for unit/integration/e2e tests
- [X] T006 [P] Create i18n types file at frontend/src/lib/i18n/types.ts with Language and Currency types
- [X] T007 [P] Update storage service at frontend/src/lib/services/storage.ts to add getSettings/saveSettings methods

---

## Phase 2: Foundational (Settings Store & Persistence)

**Purpose**: Core settings store with LocalStorage persistence - implements **User Story 3 (P1): Persist Settings Across Sessions**

**⚠️ CRITICAL**: This phase MUST be complete before User Stories 1 and 2 can be implemented. The settings store is the foundation for both language and currency features.

**User Story 3 Goal**: Users can save language and currency preferences that persist across browser sessions

**Independent Test**: Change settings, close browser completely, reopen application, verify both language and currency settings remain as configured

### Tests for Foundational Phase

- [X] T008 [P] Create unit test file for settings store at frontend/tests/unit/settings-store.test.ts
- [X] T009 [P] Write test: Settings store initializes with defaults (Spanish, Bs.) when no stored settings
- [X] T010 [P] Write test: Settings store loads valid settings from LocalStorage
- [X] T011 [P] Write test: Settings store resets to defaults when corrupted data in LocalStorage
- [X] T012 [P] Write test: setLanguage validates and rejects invalid language codes
- [X] T013 [P] Write test: setCurrency validates and rejects invalid currency codes
- [X] T014 [P] Write test: Settings changes automatically persist to LocalStorage
- [X] T015 [P] Write test: reset() method resets to default values

### Implementation for Foundational Phase

- [X] T016 Create Zod validation schemas at frontend/src/lib/i18n/types.ts (LanguageSchema, CurrencySchema, UserSettingsSchema)
- [X] T017 Implement settings store at frontend/src/lib/stores/settings.ts with initializeSettings, setLanguage, setCurrency, reset methods
- [X] T018 Add auto-persistence subscription to settings store using storageService.saveSettings
- [X] T019 Export settings store interface with subscribe, setLanguage, setCurrency, reset methods
- [X] T106 Add `window.addEventListener('storage', ...)` in settings store to sync settings changes across browser tabs (handle `key === 'userSettings'` events and update store state)
- [X] T113 Verify synchronous settings load on app init prevents Flash of Untranslated Content (FOUT): settings must be read from LocalStorage before first render — add test confirming no language flash on cold start

**Checkpoint**: Settings store complete with persistence - User Story 3 functional. Language and currency changes now persist across sessions and sync across open tabs.

---

## Phase 3: User Story 1 - Change Application Language (Priority: P1) 🎯 MVP

**Goal**: Users can switch between Spanish and English with all UI text updating immediately (<200ms)

**Independent Test**: Navigate to settings page, select English, verify ALL interface text changes to English without page reload. Close and reopen app, verify language persists as English.

### Tests for User Story 1

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

#### Unit Tests

- [X] T020 [P] [US1] Create unit test file for i18n at frontend/tests/unit/i18n.test.ts
- [X] T021 [P] [US1] Write test: Translation function returns Spanish translation by default
- [X] T022 [P] [US1] Write test: Translation function returns English translation when language is English
- [X] T023 [P] [US1] Write test: Translation function falls back to English when Spanish translation missing
- [X] T024 [P] [US1] Write test: Translation function returns key when translation missing in all languages
- [X] T025 [P] [US1] Write test: hasTranslation returns true for existing keys
- [X] T026 [P] [US1] Write test: hasTranslation returns false for missing keys

#### Component Tests

- [X] T027 [P] [US1] Create integration test file for settings page at frontend/tests/integration/settings-page.test.ts
- [X] T028 [P] [US1] Write test: Settings page renders in Spanish by default
- [X] T029 [P] [US1] Write test: Language selector updates UI text immediately when changed
- [X] T030 [P] [US1] Write test: All translatable components update when language changes

#### E2E Tests

- [X] T031 [P] [US1] Create E2E test file at frontend/tests/e2e/settings.spec.ts
- [X] T032 [P] [US1] Write test: User changes language from Spanish to English, all text updates
- [X] T033 [P] [US1] Write test: User changes language, closes browser, reopens, language persists
- [X] T034 [P] [US1] Write test: Settings page accessible from navigation in max 2 clicks
- [X] T035 [P] [US1] Write test: Language switch completes in under 200ms (SC-001)

### Implementation for User Story 1

#### Translation Files

- [X] T036 [P] [US1] Create Spanish translation file at frontend/src/lib/i18n/translations/es.json with common, navigation, settings, transactions, wallets, categories keys (~100 strings)
- [X] T037 [P] [US1] Create English translation file at frontend/src/lib/i18n/translations/en.json with same keys as Spanish

#### i18n System

- [X] T038 [US1] Implement translation system at frontend/src/lib/i18n/index.ts with t derived store, getCurrentLanguage, hasTranslation, getAllKeys functions
- [X] T039 [US1] Integrate translation store with settings store for reactive language updates
- [X] T040 [US1] Add translation fallback chain (current language → English → key)
- [X] T041 [US1] Add console warnings for missing translations

#### Settings UI Components

- [X] T042 [P] [US1] Create LanguageSelector component at frontend/src/lib/components/settings/LanguageSelector.svelte with Spanish/English dropdown
- [X] T043 [P] [US1] Create main SettingsPage component at frontend/src/lib/components/settings/SettingsPage.svelte with language and currency sections
- [X] T044 [US1] Create settings route at frontend/src/routes/settings/+page.svelte importing SettingsPage component

#### Navigation Integration

- [X] T045 [US1] Update Navigation component at frontend/src/lib/components/layout/Navigation.svelte to add Settings link with icon
- [X] T046 [US1] Wrap Navigation component text with $t() calls for reactive translations

#### Component Translation Updates

- [X] T047 [P] [US1] Update TransactionForm component at frontend/src/lib/components/transactions/TransactionForm.svelte to wrap all text with $t()
- [X] T048 [P] [US1] Update TransactionFilters component at frontend/src/lib/components/transactions/TransactionFilters.svelte to wrap all text with $t()
- [X] T049 [P] [US1] Update TransactionList component at frontend/src/lib/components/transactions/TransactionList.svelte to wrap all text with $t()
- [X] T050 [P] [US1] Update WalletForm component at frontend/src/lib/components/wallets/WalletForm.svelte to wrap all text with $t()
- [X] T051 [P] [US1] Update CategoryForm component at frontend/src/lib/components/categories/CategoryForm.svelte to wrap all text with $t()
- [X] T107 [P] [US1] Update WalletList component at frontend/src/lib/components/wallets/WalletList.svelte to wrap all text with $t()
- [X] T108 [P] [US1] Update CategoryList component at frontend/src/lib/components/categories/CategoryList.svelte to wrap all text with $t()
- [X] T109 [P] [US1] Update CategorySummary component at frontend/src/lib/components/categories/CategorySummary.svelte to wrap all text with $t()
- [X] T110 [P] [US1] Update MonthSummaryCard component at frontend/src/lib/components/dashboard/MonthSummaryCard.svelte to wrap all text with $t()
- [X] T111 [P] [US1] Update CategoryBreakdown component at frontend/src/lib/components/dashboard/CategoryBreakdown.svelte to wrap all text with $t()
- [X] T112 [P] [US1] Update SavingsRateDisplay component at frontend/src/lib/components/dashboard/SavingsRateDisplay.svelte to wrap all text with $t()

**Checkpoint**: User Story 1 complete and independently testable. Users can change language, all UI updates, settings persist. MVP deliverable!

---

## Phase 4: User Story 2 - Configure Currency Display (Priority: P2)

**Goal**: Users can switch between Bs. and $ currency symbols with all amounts updating immediately (<200ms). Display only, no conversion.

**Independent Test**: Create transactions with amounts, change currency setting from Bs. to $, verify all displayed amounts update to show $ symbol while numerical values remain unchanged.

### Tests for User Story 2

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

#### Unit Tests

- [X] T052 [P] [US2] Create unit test file for currency formatter at frontend/tests/unit/currency.test.ts
- [X] T053 [P] [US2] Write test: formatCurrency formats Bs. with Spanish locale (1.500,00)
- [X] T054 [P] [US2] Write test: formatCurrency formats $ with US locale (1,500.00)
- [X] T055 [P] [US2] Write test: formatCurrency uses default currency from settings store
- [X] T056 [P] [US2] Write test: formatCurrency accepts explicit currency override
- [X] T057 [P] [US2] Write test: formatCurrency handles negative amounts correctly
- [X] T058 [P] [US2] Write test: formatCurrencyCompact formats large amounts with K/M notation

#### Component Tests

- [X] T059 [P] [US2] Write test: Currency selector updates all displayed amounts when changed
- [X] T060 [P] [US2] Write test: Currency change is display-only (no numerical conversion)

#### E2E Tests

- [X] T061 [P] [US2] Write test: User changes currency from Bs. to $, all amounts update with new symbol
- [X] T062 [P] [US2] Write test: User changes currency, closes browser, reopens, currency persists
- [X] T063 [P] [US2] Write test: Currency switch completes in under 200ms (SC-002)
- [X] T064 [P] [US2] Write test: Numerical values unchanged after currency switch (display-only verification)

### Implementation for User Story 2

#### Currency Formatter Update

- [X] T065 [US2] Add CURRENCY_MAP constant to frontend/src/lib/utils/currency.ts with Bs. (BOB, es-BO) and $ (USD, en-US) mappings
- [X] T066 [US2] Update formatCurrency function signature to accept optional currency parameter with default from settings store
- [X] T067 [US2] Update formatCurrencyCompact function signature to accept optional currency parameter with default from settings store
- [X] T068 [US2] Ensure formatCurrency uses Intl.NumberFormat with correct locale based on currency

#### Settings UI Component

- [X] T069 [US2] Create CurrencySelector component at frontend/src/lib/components/settings/CurrencySelector.svelte with Bs./$ dropdown
- [X] T070 [US2] Integrate CurrencySelector into SettingsPage component

#### Component Currency Display Updates

- [X] T071 [P] [US2] Ensure TransactionForm at frontend/src/lib/components/transactions/TransactionForm.svelte displays amounts via formatCurrency — update if not already doing so
- [X] T072 [P] [US2] Ensure TransactionList at frontend/src/lib/components/transactions/TransactionList.svelte displays amounts via formatCurrency — update if not already doing so
- [X] T073 [P] [US2] Ensure Dashboard components at frontend/src/lib/components/dashboard/ display totals and balances via formatCurrency — update any that are not
- [X] T074 [P] [US2] Ensure WalletList at frontend/src/lib/components/wallets/WalletList.svelte displays balances via formatCurrency — update if not already doing so
- [X] T075 [P] [US2] Ensure CategorySummary at frontend/src/lib/components/categories/CategorySummary.svelte displays amounts via formatCurrency — update if not already doing so

**Checkpoint**: User Story 2 complete and independently testable. Users can change currency symbol, all amounts update, settings persist. Both US1 and US2 work independently!

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, final validation

### Code Quality & Validation

- [X] T076 [P] Run linter on all new files and fix any issues
- [X] T077 [P] Run TypeScript compiler in strict mode and fix any type errors
- [X] T078 [P] Verify all methods stay under 30 lines and 15 cyclomatic complexity (constitution requirement)
- [X] T079 Verify no XSS vulnerabilities in translation rendering (plain text only)
- [X] T080 Verify Zod validation prevents invalid language/currency codes

### Performance Validation

- [ ] T081 [P] Measure and verify language switch completes in <200ms (SC-001)
- [ ] T082 [P] Measure and verify currency switch completes in <200ms (SC-002)
- [ ] T083 [P] Verify mobile UI response time <100ms (constitution requirement)
- [ ] T084 [P] Verify settings page load time <2 seconds (constitution requirement)

### Test Coverage

- [X] T085 Run test coverage report and verify 85%+ coverage achieved (target exceeds 80% minimum)
- [X] T086 [P] Add any missing edge case tests identified in coverage report
- [X] T087 Run all unit tests and ensure 100% pass rate
- [X] T088 Run all integration tests and ensure 100% pass rate
- [ ] T089 Run all E2E tests and ensure 100% pass rate

### Translation Coverage

- [X] T090 Verify 100% of UI text is translated in both Spanish and English (SC-003)
- [ ] T091 Manually test app in Spanish and verify all text displays correctly
- [ ] T092 Manually test app in English and verify all text displays correctly
- [X] T093 Verify no translation keys are missing (check console for warnings)

### Documentation & Validation

- [ ] T114 Create ADR at specs/002-settings-i18n-currency/adr-001-i18n-approach.md documenting: decision to use custom dictionary-based i18n over external libraries (rationale: Svelte 5 runes compatibility, zero dependencies, <0.01ms lookup), and synchronous LocalStorage load strategy to prevent FOUT (constitution Development Workflow requirement)
- [ ] T094 [P] Verify quickstart.md examples work correctly
- [ ] T095 [P] Update README if needed with i18n usage instructions
- [ ] T096 Run through all acceptance scenarios from spec.md and verify each passes
- [ ] T097 Test all edge cases from spec.md (multi-tab, corrupted LocalStorage, invalid codes)

### Accessibility & UX

- [ ] T098 [P] Verify all touch targets are minimum 44x44px (constitution requirement)
- [ ] T099 [P] Verify settings page is accessible from any page in max 2 clicks (SC-005)
- [ ] T100 [P] Verify users can complete settings configuration in under 30 seconds (SC-006)
- [ ] T101 Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] T105 Audit SettingsPage, LanguageSelector, and CurrencySelector for WCAG AA compliance: keyboard navigation (Tab/Enter/Space), ARIA labels on all controls, focus indicators visible, color contrast ratio ≥ 4.5:1 (constitution Principle III MUST)

### Final Validation

- [ ] T102 Run full build and ensure no errors
- [ ] T103 Deploy to dev environment and smoke test
- [ ] T104 Verify all constitution checks pass (code quality, testing, UX, performance, security)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS User Stories 1 and 2
  - Implements **User Story 3 (P1): Persist Settings**
- **User Story 1 (Phase 3)**: Depends on Foundational completion
  - Can proceed in parallel with User Story 2 (if team capacity allows)
- **User Story 2 (Phase 4)**: Depends on Foundational completion
  - Can proceed in parallel with User Story 1 (if team capacity allows)
- **Polish (Phase 5)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 3 (P1)** - Persist Settings: Implemented in Foundational phase (Phase 2)
  - BLOCKS User Stories 1 and 2
  - Deliverable: Settings store with LocalStorage persistence

- **User Story 1 (P1)** - Change Application Language: Phase 3
  - Depends on: Foundational (Phase 2) complete
  - Independent from: User Story 2
  - Deliverable: i18n system, language selector, all UI translated

- **User Story 2 (P2)** - Configure Currency Display: Phase 4
  - Depends on: Foundational (Phase 2) complete
  - Independent from: User Story 1
  - Deliverable: Currency formatter, currency selector, all amounts formatted

### Within Each Phase

**Foundational Phase (Settings Store)**:
1. Tests first (T008-T015) - can run in parallel
2. Zod schemas (T016)
3. Settings store implementation (T017-T019)

**User Story 1 (Language)**:
1. Tests first (T020-T035) - all tests can run in parallel
2. Translation files (T036-T037) - can run in parallel
3. i18n system (T038-T041) - sequential
4. UI components (T042-T044) - mostly parallel
5. Navigation integration (T045-T046) - sequential
6. Component updates (T047-T051) - can run in parallel

**User Story 2 (Currency)**:
1. Tests first (T052-T064) - all tests can run in parallel
2. Currency formatter (T065-T068) - sequential
3. UI components (T069-T070) - sequential
4. Component updates (T071-T075) - can run in parallel

### Parallel Opportunities

**Within Setup (Phase 1)**: All T001-T007 can run in parallel (different files)

**Within Foundational Phase (Phase 2)**:
- All tests (T008-T015) can run in parallel
- Implementation tasks are sequential

**Within User Story 1 (Phase 3)**:
- All unit tests (T020-T026) can run in parallel
- All component tests (T027-T030) can run in parallel
- All E2E tests (T031-T035) can run in parallel
- Translation files (T036-T037) can run in parallel
- UI components (T042-T043) can run in parallel
- Component updates (T047-T051) can run in parallel

**Within User Story 2 (Phase 4)**:
- All unit tests (T052-T058) can run in parallel
- Component tests (T059-T060) can run in parallel
- All E2E tests (T061-T064) can run in parallel
- Component updates (T071-T075) can run in parallel

**Across User Stories**:
- Once Foundational (Phase 2) completes, User Story 1 (Phase 3) and User Story 2 (Phase 4) can proceed in parallel if team capacity allows

---

## Parallel Example: User Story 1

```bash
# Step 1: Launch all unit tests together (write these first, ensure they fail):
Task T020: Create test file for i18n
Task T021: Test Spanish translation by default
Task T022: Test English translation when selected
Task T023: Test fallback to English
Task T024: Test fallback to key
Task T025: Test hasTranslation returns true
Task T026: Test hasTranslation returns false

# Step 2: Launch all component tests together:
Task T027: Create settings page test file
Task T028: Test page renders in Spanish
Task T029: Test language selector updates UI
Task T030: Test all components update

# Step 3: Launch all E2E tests together:
Task T031: Create E2E test file
Task T032: Test language change updates text
Task T033: Test language persists across sessions
Task T034: Test settings accessible in 2 clicks
Task T035: Test language switch under 200ms

# Step 4: Launch translation files together:
Task T036: Create Spanish translations
Task T037: Create English translations

# Step 5: Implement i18n system (sequential):
Task T038: Translation system with t store
Task T039: Integrate with settings store
Task T040: Add fallback chain
Task T041: Add console warnings

# Step 6: Launch UI components together:
Task T042: Language selector component
Task T043: Settings page component

# Step 7: Navigation updates (sequential):
Task T044: Create settings route
Task T045: Add settings link to navigation
Task T046: Wrap navigation text with $t()

# Step 8: Launch component updates together:
Task T047: Update TransactionForm with $t()
Task T048: Update TransactionFilters with $t()
Task T049: Update TransactionList with $t()
Task T050: Update WalletForm with $t()
Task T051: Update CategoryForm with $t()
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 3 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T019) - **Implements User Story 3**
   - **VALIDATE US3**: Test settings persistence across browser sessions
3. Complete Phase 3: User Story 1 (T020-T051)
   - **VALIDATE US1**: Test language switching and persistence
4. **STOP and VALIDATE**: Test both US1 and US3 together
5. Deploy/demo MVP (language switching with persistence)

### Incremental Delivery

1. **Foundation** (Phases 1-2):
   - Setup + Settings Store with Persistence
   - Deliverable: User Story 3 complete (persistence works)

2. **MVP** (Phase 3):
   - Add i18n system and language switching
   - Deliverable: User Stories 1 + 3 complete (language + persistence)
   - Deploy/Demo this as MVP!

3. **Full Feature** (Phase 4):
   - Add currency formatting and selector
   - Deliverable: User Stories 1 + 2 + 3 complete (language + currency + persistence)
   - Deploy/Demo full feature

4. **Production Ready** (Phase 5):
   - Polish, validation, full test coverage
   - Deploy to production

### Parallel Team Strategy

With multiple developers:

1. **Team completes Phases 1-2 together** (foundation required for both stories)
2. **Once Foundational complete**:
   - Developer A: User Story 1 (language) - Phase 3
   - Developer B: User Story 2 (currency) - Phase 4
3. **Stories merge independently** - each is fully functional and tested
4. **Team completes Phase 5 together** (polish and validation)

---

## Notes

- **[P]** tasks = different files, no dependencies
- **[Story]** label maps task to specific user story for traceability
- **Tests included**: Target 85% coverage (exceeds 80% minimum)
- **User Story 3 (Persistence)** is foundational - implemented in Phase 2
- **User Stories 1 and 2** are independent and can run in parallel after Phase 2
- **MVP scope**: Phases 1-3 deliver language switching with persistence
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All performance targets validated in Phase 5

