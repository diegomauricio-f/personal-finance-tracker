# Data Model

**Feature**: Application Language and Currency Settings
**Date**: 2025-01-08
**Storage**: Browser LocalStorage (JSON serialization)

## Overview

This document defines the data entities, validation rules, and storage schema for user settings (language and currency preferences). Settings are persisted in LocalStorage and loaded synchronously on application initialization.

---

## Entities

### UserSettings

Represents user preferences for application language and currency display.

**TypeScript Interface**:
```typescript
interface UserSettings {
  language: Language;   // Selected language code
  currency: Currency;   // Selected currency symbol
}

type Language = 'es' | 'en';
type Currency = 'Bs.' | '$';
```

**Validation Rules** (from spec FR-014, FR-015):
- `language`: Required, must be 'es' or 'en' (whitelisted)
- `currency`: Required, must be 'Bs.' or '$' (whitelisted)

**Zod Schema**:
```typescript
import { z } from 'zod';

export const LanguageSchema = z.enum(['es', 'en']);
export const CurrencySchema = z.enum(['Bs.', '$']);

export const UserSettingsSchema = z.object({
  language: LanguageSchema,
  currency: CurrencySchema
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type Currency = z.infer<typeof CurrencySchema>;
```

**Default Values** (from spec FR-003, FR-006):
```typescript
const DEFAULT_SETTINGS: UserSettings = {
  language: 'es',  // Spanish default
  currency: 'Bs.'  // Bolivianos default
};
```

**Relationships**:
- None (settings are standalone, not related to other entities)

**Indexes**:
- Not applicable (single settings object, not a collection)

**State Transitions**:
```
[No Settings] ────────────> [Default Settings]
                                   │
                                   │ User changes language/currency
                                   ▼
                            [Custom Settings]
                                   │
                                   │ LocalStorage cleared
                                   ▼
                            [Default Settings]
```

**Business Rules**:
- Settings apply globally to all UI text and currency displays
- Invalid stored settings reset to defaults (graceful degradation per FR-016)
- Language change updates all visible UI text immediately (FR-011)
- Currency change updates all visible amounts immediately (FR-012)
- No conversion calculations when currency changes (FR-013)

---

### Translation

Represents a collection of translated UI strings for a specific language.

**TypeScript Interface**:
```typescript
interface Translations {
  [key: string]: string;  // Flat key-value structure
}

// Example keys
type TranslationKey =
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.add'
  | 'navigation.dashboard'
  | 'navigation.transactions'
  | 'navigation.wallets'
  | 'navigation.categories'
  | 'navigation.settings'
  | 'settings.title'
  | 'settings.language'
  | 'settings.currency'
  | 'settings.language.spanish'
  | 'settings.language.english'
  | 'settings.currency.bolivianos'
  | 'settings.currency.dollars'
  | 'transactions.title'
  | 'transactions.newTransaction'
  | 'transactions.editTransaction'
  | 'transactions.date'
  | 'transactions.amount'
  | 'transactions.type'
  | 'transactions.wallet'
  | 'transactions.category'
  | 'transactions.note'
  | 'transactions.income'
  | 'transactions.expense'
  // ... ~100 total keys
  ;
```

**Validation Rules**:
- Translation keys must be present in both `es.json` and `en.json` (100% coverage per SC-003)
- Keys use lowercase with dot notation (e.g., `navigation.dashboard`)
- Values are plain strings (no HTML, prevents XSS)
- Missing translations fall back to English, then to key itself (FR-016)

**Storage**:
- Translations are NOT stored in LocalStorage
- Stored as static JSON files bundled with application
- Loaded synchronously on module initialization

**Translation Files**:
```
frontend/src/lib/i18n/translations/
├── es.json  (~2.5KB)
└── en.json  (~2.5KB)
```

**Business Rules**:
- All translations loaded upfront (no lazy loading for 2 languages)
- Fallback chain: requested language → English → key itself
- Translation function is reactive (updates when language changes)
- Keys without translations display the key (developer-friendly debugging)

---

## LocalStorage Schema

### Storage Keys

```typescript
const STORAGE_KEYS = {
  SETTINGS: 'userSettings',
  WALLETS: 'wallets',
  CATEGORIES: 'categories',
  TRANSACTIONS: 'transactions'
};
```

### Settings Storage Format

**Key**: `userSettings`

**Value**: JSON string
```json
{
  "language": "es",
  "currency": "Bs."
}
```

**Size**: ~50 bytes (negligible compared to 5MB LocalStorage quota)

**Persistence Strategy**:
- **Read**: Synchronous on settings store initialization
- **Write**: Automatic on every settings change (via store subscription)
- **Validation**: Zod schema validation on read, fallback to defaults on error
- **Error Handling**: Log warnings but don't block app if corrupted

---

## Currency Configuration

Mapping between user-friendly currency symbols and ISO codes for Intl.NumberFormat.

**TypeScript Interface**:
```typescript
interface CurrencyConfig {
  code: string;   // ISO 4217 currency code
  locale: string; // BCP 47 locale tag for formatting
}

const CURRENCY_MAP: Record<Currency, CurrencyConfig> = {
  'Bs.': {
    code: 'BOB',      // Bolivian Boliviano
    locale: 'es-BO'   // Spanish (Bolivia)
  },
  '$': {
    code: 'USD',      // United States Dollar
    locale: 'en-US'   // English (United States)
  }
};
```

**Usage**:
```typescript
// Display only - no conversion
const config = CURRENCY_MAP[userSettings.currency];
new Intl.NumberFormat(config.locale, {
  style: 'currency',
  currency: config.code
}).format(amount);
```

**Formatting Examples**:
- Bs. (Spanish locale): `Bs. 1.500,00` (period for thousands, comma for decimals)
- $ (US locale): `$1,500.00` (comma for thousands, period for decimals)

**Business Rules**:
- Currency symbol is display-only (FR-013)
- Changing currency does NOT convert amounts (numerical values unchanged)
- Locale determines decimal/thousand separator formatting
- Both currencies use 2 decimal places

---

## Data Flow

### Settings Initialization (App Start)

```
┌─────────────────────────────────────┐
│  App Initialization                 │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  Settings Store Initialization      │
│  - Read from LocalStorage           │
│  - Validate with Zod schema         │
│  - Fallback to defaults if invalid  │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  i18n Store Initialization          │
│  - Load both translation files      │
│  - Set current language             │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  Components Render                  │
│  - Use $t() for translations        │
│  - Use formatCurrency for amounts   │
└─────────────────────────────────────┘
```

### Language Change (User Action)

```
┌─────────────────────────────────────┐
│  User selects language in Settings  │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  settings.setLanguage('en')         │
│  - Update settings store            │
│  - Persist to LocalStorage          │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  i18n derived store reactivity      │
│  - $t function updates              │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  Components auto re-render          │
│  - All $t() calls return new values │
│  - UI text updates (< 200ms)        │
└─────────────────────────────────────┘
```

### Currency Change (User Action)

```
┌─────────────────────────────────────┐
│  User selects currency in Settings  │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  settings.setCurrency('$')          │
│  - Update settings store            │
│  - Persist to LocalStorage          │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  Components auto re-render          │
│  - formatCurrency reads new default │
│  - All amounts re-format (< 200ms)  │
└─────────────────────────────────────┘
```

---

## Migration Strategy

### Adding New Language (Future)

1. Add language code to `Language` type: `type Language = 'es' | 'en' | 'fr';`
2. Update Zod schema: `LanguageSchema = z.enum(['es', 'en', 'fr'])`
3. Create translation file: `lib/i18n/translations/fr.json`
4. Import and add to translations map: `import fr from './translations/fr.json'`
5. Update settings UI to include new language option

### Adding New Currency (Future)

1. Add currency symbol to `Currency` type: `type Currency = 'Bs.' | '$' | '€';`
2. Update Zod schema: `CurrencySchema = z.enum(['Bs.', '$', '€'])`
3. Add to `CURRENCY_MAP`: `'€': { code: 'EUR', locale: 'es-ES' }`
4. Update settings UI to include new currency option

### Data Preservation

- Settings are non-critical user preferences (safe to reset to defaults)
- No data loss concerns if settings are corrupted or cleared
- Transactions and wallet data unaffected by settings changes
- Export/import functionality not needed (settings are lightweight)

---

## Validation Rules Summary

| Field | Rule | Error Handling |
|-------|------|----------------|
| `language` | Must be 'es' or 'en' | Reset to 'es' (default) |
| `currency` | Must be 'Bs.' or '$' | Reset to 'Bs.' (default) |
| LocalStorage data | Must parse as valid JSON | Reset to defaults |
| Translation keys | Must exist in both es.json and en.json | Fallback to key |

---

## Performance Considerations

### Storage Operations

- **Read**: Synchronous, <1ms (LocalStorage)
- **Write**: Synchronous, <0.5ms (LocalStorage)
- **Validation**: <0.1ms (Zod schema parse)

### Translation Lookups

- **Initial Load**: ~1-2ms (parse two 2.5KB JSON files)
- **Lookup**: <0.01ms (direct object property access)
- **Language Switch**: ~0.1ms (update derived store)

### Currency Formatting

- **Format Call**: ~0.05ms per amount (Intl.NumberFormat cached)
- **Currency Switch**: ~50-100ms total (re-render ~50 amounts on dashboard)

**All operations well within performance targets** ✅

---

## Security Considerations

### Input Validation

- ✅ Whitelist-only validation (Zod enum for language and currency)
- ✅ No user-provided translations (prevents XSS)
- ✅ Sanitize translation strings (plain text only, no HTML)
- ✅ Validate on load from LocalStorage (prevent injection)

### Data Privacy

- ✅ Settings are non-sensitive user preferences
- ✅ LocalStorage is client-side only (no server transmission)
- ✅ No PII stored in settings
- ✅ Clearing settings has no privacy impact

### Error Handling

- ✅ Graceful degradation (invalid data → reset to defaults)
- ✅ No app crash on corrupted settings
- ✅ User-friendly error messages (not technical details)
- ✅ Logging for debugging without exposing data

---

## Summary

**Entities**: 2 (UserSettings, Translation)
**Storage**: LocalStorage (1 key, ~50 bytes)
**Validation**: Zod schemas with whitelist enums
**Performance**: All targets met (<200ms switching, <1ms persistence)
**Security**: Input validation, XSS prevention, graceful error handling

Ready for contract design (Phase 1).
