# Developer Quickstart: Settings & Internationalization

**Feature**: Application Language and Currency Settings
**Date**: 2025-01-08
**Audience**: Developers implementing or extending the settings and i18n system

## Overview

This guide provides practical examples and patterns for working with user settings (language and currency) and internationalization. For detailed contracts, see the `contracts/` directory.

---

## Table of Contents

1. [Using Translations in Components](#using-translations-in-components)
2. [Formatting Currency](#formatting-currency)
3. [Accessing User Settings](#accessing-user-settings)
4. [Adding New Translations](#adding-new-translations)
5. [Testing i18n and Settings](#testing-i18n-and-settings)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)

---

## Using Translations in Components

### Basic Usage

```svelte
<script lang="ts">
  import { t } from '$lib/i18n';
</script>

<!-- Auto-reactive: updates when language changes -->
<h1>{$t('dashboard.title')}</h1>
<button>{$t('common.save')}</button>
<p>{$t('transactions.newTransaction')}</p>
```

### With Dynamic Content

```svelte
<script lang="ts">
  import { t } from '$lib/i18n';

  let walletName = $state('Efectivo');
</script>

<!-- Translation + dynamic content -->
<p>{$t('wallets.selectedWallet')}: {walletName}</p>
```

### In Form Labels

```svelte
<script lang="ts">
  import { t } from '$lib/i18n';
</script>

<label for="amount">
  {$t('transactions.amount')}
</label>
<input id="amount" type="number" placeholder={$t('transactions.enterAmount')} />
```

### Conditional Rendering

```svelte
<script lang="ts">
  import { t } from '$lib/i18n';
  import type { Transaction } from '$lib';

  interface Props {
    transaction: Transaction;
  }

  let { transaction }: Props = $props();
</script>

<span class:income={transaction.type === 'income'}>
  {$t(transaction.type === 'income' ? 'transactions.income' : 'transactions.expense')}
</span>
```

---

## Formatting Currency

### Basic Currency Formatting

```svelte
<script lang="ts">
  import { formatCurrency } from '$lib/utils/currency';
  import { walletStore } from '$lib/stores/wallets';
</script>

<!-- Uses user's selected currency automatically -->
<p>Balance: {formatCurrency($walletStore.totalBalance)}</p>
```

### Explicit Currency Override

```svelte
<script lang="ts">
  import { formatCurrency } from '$lib/utils/currency';

  let amount = 1500;
</script>

<!-- Always show as dollars regardless of user setting -->
<p>USD Amount: {formatCurrency(amount, '$')}</p>

<!-- Always show as bolivianos -->
<p>BOB Amount: {formatCurrency(amount, 'Bs.')}</p>
```

### Compact Currency Formatting

```svelte
<script lang="ts">
  import { formatCurrencyCompact } from '$lib/utils/currency';
  import { walletStore } from '$lib/stores/wallets';
</script>

<!-- Large amounts in compact form -->
<div class="summary-card">
  <h3>Total</h3>
  <p class="amount">{formatCurrencyCompact($walletStore.totalBalance)}</p>
  <!-- Shows: "$1.5K" or "Bs. 1,5 mil" -->
</div>
```

### Transaction Amount with Sign

```svelte
<script lang="ts">
  import { formatCurrency } from '$lib/utils/currency';
  import type { Transaction } from '$lib';

  interface Props {
    transaction: Transaction;
  }

  let { transaction }: Props = $props();

  // Calculate signed amount
  $: displayAmount = transaction.type === 'income'
    ? transaction.amount
    : -transaction.amount;
</script>

<span class:income={transaction.type === 'income'} class:expense={transaction.type === 'expense'}>
  {formatCurrency(displayAmount)}
</span>

<style>
  .income {
    color: green;
  }
  .expense {
    color: red;
  }
</style>
```

---

## Accessing User Settings

### Reading Current Settings

```svelte
<script lang="ts">
  import { settings } from '$lib/stores/settings';
</script>

<!-- Display current language -->
<p>Current language: {$settings.language}</p>

<!-- Display current currency -->
<p>Current currency: {$settings.currency}</p>
```

### Changing Settings

```svelte
<script lang="ts">
  import { settings } from '$lib/stores/settings';
  import type { Language, Currency } from '$lib/i18n/types';

  function handleLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    settings.setLanguage(select.value as Language);
  }

  function handleCurrencyChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    settings.setCurrency(select.value as Currency);
  }
</script>

<select value={$settings.language} onchange={handleLanguageChange}>
  <option value="es">{$t('settings.language.spanish')}</option>
  <option value="en">{$t('settings.language.english')}</option>
</select>

<select value={$settings.currency} onchange={handleCurrencyChange}>
  <option value="Bs.">{$t('settings.currency.bolivianos')}</option>
  <option value="$">{$t('settings.currency.dollars')}</option>
</select>
```

### Reactive Derived Values

```svelte
<script lang="ts">
  import { settings } from '$lib/stores/settings';

  // Reactive computed value
  $: isSpanish = $settings.language === 'es';
  $: isUSD = $settings.currency === '$';
</script>

{#if isSpanish}
  <p>Bienvenido</p>
{:else}
  <p>Welcome</p>
{/if}
```

---

## Adding New Translations

### Step 1: Add Keys to JSON Files

**Spanish** (`lib/i18n/translations/es.json`):
```json
{
  "existing.key": "Valor Existente",
  "newFeature.title": "Nuevo Título",
  "newFeature.description": "Esta es una nueva característica",
  "newFeature.action.save": "Guardar Cambios"
}
```

**English** (`lib/i18n/translations/en.json`):
```json
{
  "existing.key": "Existing Value",
  "newFeature.title": "New Title",
  "newFeature.description": "This is a new feature",
  "newFeature.action.save": "Save Changes"
}
```

### Step 2: Use in Components

```svelte
<script lang="ts">
  import { t } from '$lib/i18n';
</script>

<div class="new-feature">
  <h1>{$t('newFeature.title')}</h1>
  <p>{$t('newFeature.description')}</p>
  <button>{$t('newFeature.action.save')}</button>
</div>
```

### Step 3: Verify Coverage

```bash
# Run both apps in different languages
npm run dev

# Test in browser:
# 1. Change language to Spanish → verify all text is Spanish
# 2. Change language to English → verify all text is English
# 3. Check browser console for warnings about missing translations
```

### Translation Key Naming Conventions

| Pattern | Example | Usage |
|---------|---------|-------|
| `<section>.<element>` | `navigation.dashboard` | Section-specific UI |
| `common.<action>` | `common.save` | Shared actions/buttons |
| `<section>.<subsection>.<element>` | `settings.language.spanish` | Nested contexts |
| `errors.<type>` | `errors.required` | Error messages |

**Rules**:
- Use lowercase only
- Separate words with dots (no spaces, underscores, or hyphens)
- Keep keys in English for consistency
- Group related keys by prefix

---

## Testing i18n and Settings

### Unit Testing Translations

```typescript
// lib/i18n/index.test.ts
import { get } from 'svelte/store';
import { t, setLanguage } from '$lib/i18n';

describe('i18n', () => {
  it('returns Spanish translation by default', () => {
    const translate = get(t);
    expect(translate('common.save')).toBe('Guardar');
  });

  it('returns English translation when language is English', () => {
    setLanguage('en');
    const translate = get(t);
    expect(translate('common.save')).toBe('Save');
  });

  it('falls back to key when translation missing', () => {
    const translate = get(t);
    expect(translate('missing.key')).toBe('missing.key');
  });
});
```

### Component Testing with Translations

```typescript
// components/MyComponent.test.ts
import { render } from '@testing-library/svelte';
import { settings } from '$lib/stores/settings';
import MyComponent from './MyComponent.svelte';

describe('MyComponent', () => {
  beforeEach(() => {
    settings.reset(); // Reset to Spanish
  });

  it('renders in Spanish by default', () => {
    const { getByText } = render(MyComponent);
    expect(getByText('Guardar')).toBeInTheDocument();
  });

  it('updates to English when language changes', async () => {
    const { getByText } = render(MyComponent);

    settings.setLanguage('en');
    await tick();

    expect(getByText('Save')).toBeInTheDocument();
  });
});
```

### E2E Testing Settings Persistence

```typescript
// e2e/settings.spec.ts
import { test, expect } from '@playwright/test';

test('language setting persists across sessions', async ({ page }) => {
  await page.goto('/settings');

  // Change to English
  await page.selectOption('select#language', 'en');
  await expect(page.locator('h1')).toContainText('Settings');

  // Reload page
  await page.reload();

  // Should still be in English
  await expect(page.locator('h1')).toContainText('Settings');
});
```

---

## Common Patterns

### Pattern 1: Navigation Menu with Translations

```svelte
<script lang="ts">
  import { t } from '$lib/i18n';
  import { page } from '$app/stores';

  const navItems = [
    { href: '/', labelKey: 'navigation.dashboard', icon: '📊' },
    { href: '/transactions', labelKey: 'navigation.transactions', icon: '💰' },
    { href: '/wallets', labelKey: 'navigation.wallets', icon: '👛' },
    { href: '/categories', labelKey: 'navigation.categories', icon: '🏷️' },
    { href: '/settings', labelKey: 'navigation.settings', icon: '⚙️' }
  ];

  function isActive(href: string): boolean {
    return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
  }
</script>

<nav>
  {#each navItems as item}
    <a href={item.href} class:active={isActive(item.href)}>
      <span>{item.icon}</span>
      <span>{$t(item.labelKey)}</span>
    </a>
  {/each}
</nav>
```

### Pattern 2: Form with Validation Messages

```svelte
<script lang="ts">
  import { t } from '$lib/i18n';

  let amount = $state('');
  let errors = $state<Record<string, string>>({});

  function validate(): boolean {
    errors = {};

    if (!amount) {
      errors.amount = $t('errors.amountRequired');
      return false;
    }

    const num = parseFloat(amount);
    if (isNaN(num)) {
      errors.amount = $t('errors.amountInvalid');
      return false;
    }

    if (num === 0) {
      errors.amount = $t('errors.amountZero');
      return false;
    }

    return true;
  }
</script>

<form onsubmit={() => validate() && handleSubmit()}>
  <label for="amount">{$t('transactions.amount')}</label>
  <input
    id="amount"
    type="number"
    bind:value={amount}
    placeholder={$t('transactions.enterAmount')}
  />
  {#if errors.amount}
    <p class="error">{errors.amount}</p>
  {/if}
</form>
```

### Pattern 3: Currency Display in Cards

```svelte
<script lang="ts">
  import { formatCurrency } from '$lib/utils/currency';
  import type { Wallet } from '$lib';

  interface Props {
    wallets: Wallet[];
  }

  let { wallets }: Props = $props();
</script>

<div class="wallets-grid">
  {#each wallets as wallet}
    <div class="wallet-card">
      <h3>{wallet.name}</h3>
      <p class="balance">{formatCurrency(wallet.balance)}</p>
    </div>
  {/each}
</div>
```

### Pattern 4: Settings Page Component

```svelte
<script lang="ts">
  import { t } from '$lib/i18n';
  import { settings } from '$lib/stores/settings';
  import type { Language, Currency } from '$lib/i18n/types';

  let language = $state($settings.language);
  let currency = $state($settings.currency);

  function saveSettings() {
    settings.setLanguage(language);
    settings.setCurrency(currency);
    // Success message
  }

  function resetSettings() {
    settings.reset();
    language = $settings.language;
    currency = $settings.currency;
  }
</script>

<div class="settings-page">
  <h1>{$t('settings.title')}</h1>

  <div class="form-group">
    <label for="language">{$t('settings.language')}</label>
    <select id="language" bind:value={language}>
      <option value="es">{$t('settings.language.spanish')}</option>
      <option value="en">{$t('settings.language.english')}</option>
    </select>
  </div>

  <div class="form-group">
    <label for="currency">{$t('settings.currency')}</label>
    <select id="currency" bind:value={currency}>
      <option value="Bs.">{$t('settings.currency.bolivianos')}</option>
      <option value="$">{$t('settings.currency.dollars')}</option>
    </select>
  </div>

  <div class="actions">
    <button onclick={saveSettings}>{$t('common.save')}</button>
    <button onclick={resetSettings}>{$t('common.reset')}</button>
  </div>
</div>
```

---

## Troubleshooting

### Issue: Translation Key Not Found

**Symptoms**: UI shows the key instead of translated text (e.g., "navigation.dashboard")

**Diagnosis**:
1. Check browser console for warnings: `Missing translation: navigation.dashboard`
2. Verify key exists in both `es.json` and `en.json`
3. Check for typos in key name

**Solution**:
```json
// Add missing key to both translation files
// es.json
{ "navigation.dashboard": "Panel" }

// en.json
{ "navigation.dashboard": "Dashboard" }
```

---

### Issue: Translations Not Updating

**Symptoms**: UI doesn't update when language changes

**Diagnosis**:
1. Check if using `$t()` auto-subscription syntax
2. Verify component is reactive to store changes

**Solution**:
```svelte
<!-- ❌ Wrong: Static translation -->
<script>
  import { get } from 'svelte/store';
  import { t } from '$lib/i18n';

  const title = get(t)('dashboard.title'); // Static, won't update
</script>
<h1>{title}</h1>

<!-- ✅ Correct: Reactive translation -->
<script>
  import { t } from '$lib/i18n';
</script>
<h1>{$t('dashboard.title')}</h1>
```

---

### Issue: Currency Not Formatting Correctly

**Symptoms**: Currency displays with wrong symbol or locale

**Diagnosis**:
1. Check user's selected currency in settings
2. Verify currency parameter if explicitly passed

**Solution**:
```svelte
<script>
  import { formatCurrency } from '$lib/utils/currency';
  import { settings } from '$lib/stores/settings';

  let amount = 1500;

  // Debug: Log current currency
  console.log('Current currency:', $settings.currency);
</script>

<!-- Will use current setting -->
<p>{formatCurrency(amount)}</p>

<!-- Override for testing -->
<p>Bs: {formatCurrency(amount, 'Bs.')}</p>
<p>$: {formatCurrency(amount, '$')}</p>
```

---

### Issue: Settings Not Persisting

**Symptoms**: Settings reset to default after page reload

**Diagnosis**:
1. Check LocalStorage in browser DevTools (Application → Local Storage)
2. Look for `userSettings` key
3. Check browser console for errors saving to LocalStorage

**Solution**:
```typescript
// Manually test LocalStorage
localStorage.setItem('userSettings', JSON.stringify({ language: 'en', currency: '$' }));
location.reload(); // Should load with English and $

// Check quota errors
try {
  settings.setLanguage('en');
} catch (e) {
  console.error('Failed to save settings:', e);
}
```

---

### Issue: Performance Slow on Language Switch

**Symptoms**: UI takes >200ms to update after language change

**Diagnosis**:
1. Open browser DevTools → Performance tab
2. Record language switch action
3. Look for slow re-renders or excessive component updates

**Solution**:
```svelte
<!-- Optimize: Use derived stores instead of effects -->

<!-- ❌ Less optimal: Manual effect -->
<script>
  import { settings } from '$lib/stores/settings';
  let translatedTitle = $state('');

  $effect(() => {
    translatedTitle = getTranslation($settings.language, 'title');
  });
</script>
<h1>{translatedTitle}</h1>

<!-- ✅ Optimal: Use reactive translation -->
<script>
  import { t } from '$lib/i18n';
</script>
<h1>{$t('dashboard.title')}</h1>
```

---

## Quick Reference

### Import Statements

```typescript
// Translations
import { t } from '$lib/i18n';

// Settings store
import { settings } from '$lib/stores/settings';

// Currency formatting
import { formatCurrency, formatCurrencyCompact } from '$lib/utils/currency';

// Types
import type { Language, Currency } from '$lib/i18n/types';
```

### Common Operations

```typescript
// Get translated text
$t('common.save')

// Format currency (uses user setting)
formatCurrency(1500)

// Format currency (explicit)
formatCurrency(1500, '$')

// Format compact
formatCurrencyCompact(1000000)

// Get current language
$settings.language

// Change language
settings.setLanguage('en')

// Get current currency
$settings.currency

// Change currency
settings.setCurrency('$')

// Reset to defaults
settings.reset()
```

---

## Next Steps

1. **Implement a component** using the patterns above
2. **Add translations** for your new UI text
3. **Test in both languages** (Spanish and English)
4. **Verify persistence** by reloading the page
5. **Check performance** (language switch < 200ms)

For detailed API contracts, see:
- [Settings Store Contract](./contracts/settings-store.md)
- [Translation Contract](./contracts/translation.md)
- [Currency Formatter Contract](./contracts/currency-formatter.md)

For implementation details, see:
- [Data Model](./data-model.md)
- [Research Decisions](./research.md)
- [Implementation Plan](./plan.md)
