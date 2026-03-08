# diegomauriciof Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-08

## Active Technologies
- JavaScript/TypeScript with SvelteKit 2.x (latest stable) (001-personal-finance-tracker)
- Custom dictionary-based i18n with Svelte stores (002-settings-i18n-currency)
- Chart.js 4.x via raw canvas + Svelte 5 onMount/$effect (003-chartjs-trends-chart)

## i18n (Internationalization)
**Approach**: Custom dictionary-based translation system (no external library)
**Languages**: Spanish (default), English
**Translation Files**: Flat JSON structure with dot notation (`lib/i18n/translations/*.json`)
**Usage**: `{$t('key.name')}` in components for reactive translations
**Fallback Chain**: Current language → English → Key itself
**Performance**: <200ms language switching, <0.01ms translation lookup

## Settings Persistence
**Storage**: Browser LocalStorage
**Key**: `userSettings`
**Format**: JSON `{ language: 'es' | 'en', currency: 'Bs.' | '$' }`
**Loading**: Synchronous on app initialization
**Validation**: Zod schema with whitelist enums
**Default**: Spanish language, Bs. currency

## Currency Formatting
**Function**: `formatCurrency(amount, currency?)`
**Default**: Reads from user settings store
**Behavior**: Display-only (no conversion calculations)
**Locales**: es-BO (Bolivianos), en-US (Dollars)
**Format**: Bs. uses `1.500,00` | $ uses `$1,500.00`

## Project Structure
```
backend/
frontend/
  src/
    lib/
      i18n/                    # Translation system
        translations/
          es.json              # Spanish translations
          en.json              # English translations
        index.ts               # Translation utilities
        types.ts               # Language, Currency types
      stores/
        settings.ts            # Settings store (NEW)
      components/
        settings/              # Settings UI components (NEW)
      utils/
        currency.ts            # Updated with currency param
tests/
```

## Commands
npm test; npm run lint

## Code Style
JavaScript/TypeScript with SvelteKit 2.x (latest stable): Follow standard conventions

## Chart.js Integration
**Library**: Chart.js 4.x (MIT license) — replaces layerchart
**Pattern**: Raw canvas binding with `onMount` for init, `$effect` for reactive updates
**Responsive**: `responsive: true`, `maintainAspectRatio: false` — native ResizeObserver
**Tooltips**: Locale-aware via `buildTooltipCallbacks(currency, language)` pure function
**Testing**: Canvas not unit-testable in jsdom; data transformers tested in unit tests; rendering tested in E2E

## Recent Changes
- 003-chartjs-trends-chart: Replaced layerchart with Chart.js for mobile-responsive trend chart
- 002-settings-i18n-currency: Added custom i18n system and user settings persistence
- 001-personal-finance-tracker: Added JavaScript/TypeScript with SvelteKit 2.x (latest stable)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
