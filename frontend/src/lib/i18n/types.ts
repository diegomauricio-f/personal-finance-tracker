/**
 * i18n type definitions and validation schemas
 *
 * @see specs/002-settings-i18n-currency/data-model.md
 * @see specs/002-settings-i18n-currency/plan.md
 */

import { z } from 'zod';

/**
 * Supported languages
 * - 'es': Spanish (default)
 * - 'en': English
 */
export type Language = 'es' | 'en';

/**
 * Supported currencies (display-only, no conversion)
 * - 'Bs.': Bolivianos (default)
 * - '$': US Dollars
 */
export type Currency = 'Bs.' | '$';

/**
 * User settings interface
 */
export interface UserSettings {
  language: Language;
  currency: Currency;
}

/**
 * Zod validation schema for Language
 * Whitelists only valid language codes
 */
export const LanguageSchema = z.enum(['es', 'en']);

/**
 * Zod validation schema for Currency
 * Whitelists only valid currency codes
 */
export const CurrencySchema = z.enum(['Bs.', '$']);

/**
 * Zod validation schema for UserSettings
 * Validates both language and currency fields
 */
export const UserSettingsSchema = z.object({
  language: LanguageSchema,
  currency: CurrencySchema
});

/**
 * Default user settings
 * Spanish language, Bolivianos currency
 */
export const DEFAULT_SETTINGS: UserSettings = {
  language: 'es',
  currency: 'Bs.'
};
