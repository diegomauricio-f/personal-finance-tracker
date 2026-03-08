# diegomauriciof Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-08

## Active Technologies
- JavaScript/TypeScript with SvelteKit 2.x (latest stable) (001-personal-finance-tracker)
- Custom dictionary-based i18n with Svelte stores (002-settings-i18n-currency)
- Chart.js 4.x via raw canvas + Svelte 5 onMount/$effect (003-chartjs-trends-chart)
- Supabase Auth + PostgreSQL via @supabase/ssr (005-user-auth-db-migration)

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

## Supabase Integration
**Auth Package**: `@supabase/ssr` (NOT deprecated `@supabase/auth-helpers-sveltekit`)
**Session Storage**: Cookies (not localStorage) — required for SSR route protection
**Auth Flow**: PKCE — requires `/auth/callback` route to exchange code for session
**Server Hook**: `createServerClient` fresh per request; call `getUser()` (validates JWT); attach `supabase`, `session`, `user` to `event.locals`
**Layout**: `createBrowserClient` once; `invalidate('supabase:auth')` on `onAuthStateChange`
**Route Groups**: `(app)/` = protected (guard in `+layout.server.ts`); `(auth)/` = public auth pages
**RLS**: All user tables use `user_id = auth.uid()` policies; `categories` uses `user_id IS NULL` for global rows
**Migration RPC**: `supabase.rpc('migrate_local_data', payload)` — atomic PostgreSQL stored procedure; UUID-preserving; idempotent via `ON CONFLICT (id) DO NOTHING`
**Migration Flag**: `raw_app_meta_data.local_migration_completed` — service-role-only write
**Env Vars**: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` (browser-safe); `SUPABASE_SERVICE_ROLE_KEY` (server only)

## Recent Changes
- 005-user-auth-db-migration: Added Supabase Auth, cloud PostgreSQL DB, and local data migration
- 003-chartjs-trends-chart: Replaced layerchart with Chart.js for mobile-responsive trend chart
- 002-settings-i18n-currency: Added custom i18n system and user settings persistence
- 001-personal-finance-tracker: Added JavaScript/TypeScript with SvelteKit 2.x (latest stable)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
