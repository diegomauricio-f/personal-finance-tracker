/**
 * Currency formatting utility using Intl.NumberFormat
 * Updated to support user currency settings
 *
 * @see specs/001-personal-finance-tracker/plan.md lines 178-182
 * @see specs/001-personal-finance-tracker/research.md lines 219-225
 * @see specs/002-settings-i18n-currency/plan.md
 * @see specs/002-settings-i18n-currency/tasks.md lines 175-179
 */

import { get } from 'svelte/store';
import { settingsStore } from '$lib/stores/settings';
import type { Currency } from '$lib/i18n/types';

/**
 * Currency mapping configuration
 * Maps display currency symbols to ISO codes and locales
 *
 * - Bs. (Bolivianos): BOB currency with es-BO locale → 1.500,00 format
 * - $ (US Dollars): USD currency with en-US locale → $1,500.00 format
 */
interface CurrencyConfig {
  code: string; // ISO 4217 currency code
  locale: string; // BCP 47 locale code
}

export const CURRENCY_MAP: Record<Currency, CurrencyConfig> = {
  'Bs.': {
    code: 'BOB', // Bolivian Boliviano
    locale: 'es-BO' // Spanish (Bolivia)
  },
  '$': {
    code: 'USD', // US Dollar
    locale: 'en-US' // English (United States)
  }
};

/**
 * Formats a number as currency using the user's preferred currency setting
 *
 * @param amount - The amount to format
 * @param currency - Optional currency override (defaults to user setting from store)
 * @returns Formatted currency string
 *
 * @example
 * // With user setting Bs.:
 * formatCurrency(1500.50) // "Bs. 1.500,50"
 *
 * // With user setting $:
 * formatCurrency(1500.50) // "$1,500.50"
 *
 * // With explicit override:
 * formatCurrency(1500.50, '$') // "$1,500.50"
 */
export function formatCurrency(
  amount: number,
  currency?: Currency
): string {
  // Use provided currency or get from settings store
  const currencyToUse = currency || get(settingsStore).currency;
  const config = CURRENCY_MAP[currencyToUse];

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code
  }).format(amount);
}

/**
 * Formats a number as compact currency (e.g., $1.2K, Bs. 1,5K)
 *
 * @param amount - The amount to format
 * @param currency - Optional currency override (defaults to user setting from store)
 * @returns Formatted compact currency string
 *
 * @example
 * formatCurrencyCompact(1500.50) // "$1.5K" or "Bs. 1,5K"
 */
export function formatCurrencyCompact(
  amount: number,
  currency?: Currency
): string {
  // Use provided currency or get from settings store
  const currencyToUse = currency || get(settingsStore).currency;
  const config = CURRENCY_MAP[currencyToUse];

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    notation: 'compact'
  }).format(amount);
}
