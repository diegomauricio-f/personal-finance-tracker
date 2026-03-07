# Implementation Plan: Application Language and Currency Settings

**Branch**: `002-settings-i18n-currency` | **Date**: 2025-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-settings-i18n-currency/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add user settings for application language (Spanish/English) and currency display (Bs./$) with persistence across sessions. Technical approach uses dictionary-based i18n without external libraries, Svelte 5 reactive stores for settings management, and LocalStorage for offline-first persistence. All UI text updates reactively within 200ms performance target.

## Technical Context

**Language/Version**: TypeScript 5.9.2, Svelte 5.39.5, SvelteKit 2.43.2
**Primary Dependencies**: Zod 4.1.12 (validation), Tailwind CSS 4.1.16 (styling)
**Storage**: Browser LocalStorage (offline-first persistence)
**Testing**: Vitest 4.0.3 (unit tests), Playwright 1.56.1 (E2E tests)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
**Project Type**: Web application (frontend-only feature)
**Performance Goals**:
- Language/currency switching < 200ms (SC-001, SC-002)
- UI response time < 100ms on mobile (constitution requirement)
- Settings page load < 2 seconds (constitution requirement)

**Constraints**:
- Display-only currency (no conversion calculations)
- Two languages only (es, en)
- LocalStorage availability required
- Mobile-first design with 44x44px touch targets

**Scale/Scope**:
- ~100 translatable UI strings
- 2 languages (Spanish, English)
- 2 currency symbols (Bs., $)
- Settings stored as ~200 bytes in LocalStorage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Evaluation

**I. Code Quality First** ✅
- **Status**: COMPLIANT
- **Evidence**: Plan follows existing SvelteKit component patterns, TypeScript strict mode, no unnecessary abstractions
- **Actions**:
  - Use Zod for settings validation (already in dependencies)
  - Follow existing store patterns (walletStore, transactionStore)
  - Keep translation logic simple (dictionary lookup, no external i18n library)
  - Maximum 30 lines per method, 15 cyclomatic complexity

**II. Testing Coverage (80% minimum)** ✅
- **Status**: COMPLIANT
- **Evidence**: Feature scope is small and highly testable
- **Actions**:
  - Unit tests: settings store, translation utilities, formatCurrency
  - Component tests: SettingsPage, language switcher, currency selector
  - E2E tests: persistence across sessions, UI text updates, edge cases
  - Target: 85%+ coverage (above 80% minimum)

**III. User Experience Consistency** ✅
- **Status**: COMPLIANT
- **Evidence**: Feature explicitly designed for mobile-first responsive design
- **Actions**:
  - Settings page uses existing Tailwind component patterns
  - Touch targets minimum 44x44px (mobile requirement)
  - Instant UI updates without page reload
  - Performance < 100ms UI response on mobile
  - Settings accessible in max 2 clicks (SC-005)

**IV. Performance & Efficiency** ✅
- **Status**: COMPLIANT
- **Evidence**: Performance targets defined in spec and achievable with Svelte 5 reactivity
- **Actions**:
  - Use Svelte 5 $derived stores for reactive translation updates
  - LocalStorage reads on app init only (cached in memory)
  - No network requests (offline-first)
  - Target: < 200ms switching time (SC-001, SC-002)

**V. Security & Data Privacy** ✅
- **Status**: COMPLIANT
- **Evidence**: Settings are non-sensitive user preferences, validated input
- **Actions**:
  - Zod validation for language/currency codes (whitelist only)
  - Sanitize translation strings (prevent XSS)
  - LocalStorage is client-side only (no sensitive data)
  - Handle corrupted LocalStorage gracefully (fallback to defaults)

### Post-Design Gates (to be checked after Phase 1)

- [ ] Complexity within bounds (max 15 cyclomatic, 30 lines/method)
- [ ] Performance targets achievable with chosen architecture
- [ ] Testing strategy covers all contracts
- [ ] No security vulnerabilities in translation/formatting logic

## Project Structure

### Documentation (this feature)

```
specs/002-settings-i18n-currency/
├── spec.md              # Feature specification (COMPLETE)
├── checklists/
│   └── requirements.md  # Spec validation checklist (COMPLETE)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (PENDING)
├── data-model.md        # Phase 1 output (PENDING)
├── quickstart.md        # Phase 1 output (PENDING)
├── contracts/           # Phase 1 output (PENDING)
│   ├── settings-store.md
│   ├── translation.md
│   └── currency-formatter.md
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
frontend/
├── src/
│   ├── lib/
│   │   ├── i18n/
│   │   │   ├── index.ts           # Translation utilities (t function, loadTranslations)
│   │   │   ├── translations/
│   │   │   │   ├── es.json        # Spanish translations
│   │   │   │   └── en.json        # English translations
│   │   │   └── types.ts           # Language, TranslationKey types
│   │   │
│   │   ├── stores/
│   │   │   └── settings.ts        # Settings store (language, currency, persistence)
│   │   │
│   │   ├── services/
│   │   │   └── storage.ts         # EXISTING: LocalStorage abstraction — UPDATE: add getSettings/saveSettings
│   │   │
│   │   ├── components/
│   │   │   ├── settings/
│   │   │   │   ├── SettingsPage.svelte      # Main settings page component
│   │   │   │   ├── LanguageSelector.svelte  # Language dropdown
│   │   │   │   └── CurrencySelector.svelte  # Currency dropdown
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   └── Navigation.svelte  # UPDATE: Add Settings link
│   │   │   │
│   │   │   └── [existing components]  # UPDATE: Wrap translatable text with t()
│   │   │
│   │   └── utils/
│   │       └── currency.ts         # UPDATE: formatCurrency to accept currency param
│   │
│   └── routes/
│       └── settings/
│           └── +page.svelte        # Settings route
│
└── tests/
    ├── unit/
    │   ├── i18n.test.ts            # Translation utilities tests
    │   ├── settings-store.test.ts  # Settings store tests
    │   └── currency.test.ts        # Currency formatter tests
    │
    ├── integration/
    │   └── settings-page.test.ts   # Settings page component tests
    │
    └── e2e/
        └── settings.spec.ts        # E2E persistence and UI update tests
```

**Structure Decision**: Web application structure (Option 2) with frontend-only changes. Feature adds new `i18n/` directory for translations, new `settings.ts` store, new `settings/` components, and updates to existing Navigation and utility files.

## Phase 0: Research & Decisions

*Create: `research.md` with findings and decisions for these questions*

### Research Questions

**RQ-001: i18n Pattern for Svelte 5 Runes**
- **Question**: What is the idiomatic pattern for i18n in Svelte 5 with runes mode?
- **Options**:
  1. Custom `t()` function with reactive $derived store
  2. svelte-i18n library (may not support runes yet)
  3. Context API with $state for current language
- **Decision Criteria**: Simplicity, runes compatibility, performance < 200ms
- **Research Method**: Check Svelte 5 docs, review existing component patterns

**RQ-002: Translation File Format**
- **Question**: Should translations use flat or nested JSON structure?
- **Options**:
  1. Flat: `{ "navigation.dashboard": "Dashboard", "navigation.settings": "Settings" }`
  2. Nested: `{ "navigation": { "dashboard": "Dashboard", "settings": "Settings" } }`
- **Decision Criteria**: TypeScript type safety, ease of updates, key collision prevention
- **Research Method**: Review best practices, consider ~100 string scale

**RQ-003: Settings Persistence Strategy**
- **Question**: Should settings load synchronously on app init or asynchronously?
- **Options**:
  1. Synchronous: Load from LocalStorage in settings store initialization
  2. Asynchronous: Load on first read with loading state
  3. Hybrid: Sync load with default fallback
- **Decision Criteria**: Avoid flash of untranslated content (FOUT), performance
- **Research Method**: Test with existing SvelteKit app initialization patterns

**RQ-004: Currency Formatter Integration**
- **Question**: How should formatCurrency utility integrate with currency setting?
- **Options**:
  1. Pass currency explicitly: `formatCurrency(amount, $settings.currency)`
  2. Read from store internally: `formatCurrency(amount)` auto-detects
  3. Derived formatter: `$formatCurrency` reactive function
- **Decision Criteria**: Ease of use, testability, performance
- **Research Method**: Review existing [currency.ts](../../frontend/src/lib/utils/currency.ts) implementation

### Research Deliverables

- [ ] Decision matrix for each RQ with chosen approach
- [ ] Code examples for chosen i18n pattern
- [ ] Translation file structure sample (5-10 keys)
- [ ] Settings persistence implementation strategy
- [ ] Currency formatter integration approach

## Phase 1: Design & Contracts

*Create after research.md is complete*

### Deliverables

**1. data-model.md** - Data structures and types
- UserSettings entity (language, currency)
- Translation entity structure
- LocalStorage schema
- TypeScript interfaces

**2. contracts/settings-store.md** - Settings store API
```typescript
// Preview (to be detailed in contract)
interface SettingsStore {
  language: Readable<Language>;
  currency: Readable<Currency>;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
}
```

**3. contracts/translation.md** - Translation utilities
```typescript
// Preview (to be detailed in contract)
function t(key: string, lang?: Language): string
function loadTranslations(lang: Language): Promise<Translations>
```

**4. contracts/currency-formatter.md** - Updated currency formatter
```typescript
// Preview (to be detailed in contract)
function formatCurrency(amount: number, currency?: Currency): string
```

**5. quickstart.md** - Developer guide
- How to add new translations
- How to use t() function in components
- How to test settings changes locally
- How to add new languages (future-proofing)

**6. Update CLAUDE.md** - Technology decisions
- Add i18n approach to Active Technologies
- Document translation file structure
- Note settings persistence strategy

### Phase 1 Gates

- [ ] All contracts reviewed for simplicity
- [ ] Data model aligns with existing store patterns
- [ ] No cyclomatic complexity violations
- [ ] Testing strategy covers all contracts
- [ ] Constitution re-check passes

## Complexity Tracking

*No violations at planning stage - table intentionally left empty*

---

**Next Steps**:
1. Run `/speckit.plan` to create `research.md` (Phase 0)
2. Complete research and document decisions
3. Create Phase 1 design artifacts (data-model.md, contracts/, quickstart.md)
4. Re-check constitution compliance
5. Run `/speckit.tasks` to generate implementation tasks
