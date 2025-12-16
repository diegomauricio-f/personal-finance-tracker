/**
 * i18n translation system
 * Provides reactive translations with fallback support
 *
 * @see specs/002-settings-i18n-currency/plan.md
 * @see specs/002-settings-i18n-currency/tasks.md lines 110-115
 */

import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { settingsStore } from '$lib/stores/settings';
import type { Language } from './types';

// Import translation files
import es from './translations/es.json';
import en from './translations/en.json';

/**
 * Type for nested translation object
 */
type TranslationObject = {
  [key: string]: string | TranslationObject;
};

/**
 * Translation dictionaries by language
 */
const translations: Record<Language, TranslationObject> = {
  es,
  en
};

/**
 * Get a nested value from an object using dot notation
 * Example: get(obj, 'user.name.first') => obj.user.name.first
 */
function getNestedValue(obj: TranslationObject, path: string): string | undefined {
  const keys = path.split('.');
  let current: string | TranslationObject | undefined = obj;

  for (const key of keys) {
    if (typeof current === 'object' && current !== null && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Get all translation keys from a nested object
 */
function extractKeys(obj: TranslationObject, prefix = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      keys.push(fullKey);
    } else if (typeof value === 'object' && value !== null) {
      keys.push(...extractKeys(value, fullKey));
    }
  }

  return keys;
}

/**
 * Cache for all translation keys (computed once)
 */
let allKeysCache: string[] | null = null;

/**
 * Get translation for a key with fallback chain
 * Fallback order: current language → English → key itself
 *
 * @param key - Translation key in dot notation (e.g., 'common.welcome')
 * @param lang - Language to use (defaults to current language from settings)
 * @returns Translated string or key if not found
 */
function translate(key: string, lang: Language): string {
  // Try current language
  let translation = getNestedValue(translations[lang], key);
  if (translation) return translation;

  // Fallback to English if not the current language
  if (lang !== 'en') {
    translation = getNestedValue(translations.en, key);
    if (translation) return translation;
  }

  // Warn about missing translation
  console.warn(`Missing translation for key: "${key}" in language: "${lang}"`);

  // Return key itself as final fallback
  return key;
}

/**
 * Reactive translation store
 * Returns a function that translates keys based on current language
 *
 * Usage in Svelte components: {$t('common.welcome')}
 *
 * @see specs/002-settings-i18n-currency/plan.md
 */
export const t: Readable<(key: string) => string> = derived(
  settingsStore,
  ($settings) => (key: string) => translate(key, $settings.language)
);

/**
 * Get the current language from settings
 *
 * @returns Current language code
 */
export function getCurrentLanguage(): Language {
  let currentLang: Language = 'es';
  const unsubscribe = settingsStore.subscribe(settings => {
    currentLang = settings.language;
  });
  unsubscribe();
  return currentLang;
}

/**
 * Check if a translation exists for a given key
 *
 * @param key - Translation key to check
 * @param lang - Language to check (defaults to current language)
 * @returns True if translation exists, false otherwise
 */
export function hasTranslation(key: string, lang?: Language): boolean {
  const language = lang || getCurrentLanguage();

  // Check if key is valid (must contain at least one dot)
  if (!key || !key.includes('.')) {
    return false;
  }

  // Check current language
  const translation = getNestedValue(translations[language], key);
  if (translation) return true;

  // Check English fallback
  if (language !== 'en') {
    const englishTranslation = getNestedValue(translations.en, key);
    if (englishTranslation) return true;
  }

  return false;
}

/**
 * Get all available translation keys
 *
 * @returns Array of all translation keys
 */
export function getAllKeys(): string[] {
  if (allKeysCache) {
    return allKeysCache;
  }

  // Combine keys from both languages (unique)
  const esKeys = extractKeys(translations.es);
  const enKeys = extractKeys(translations.en);
  const allKeys = [...new Set([...esKeys, ...enKeys])];

  allKeysCache = allKeys;
  return allKeys;
}

/**
 * Clear the keys cache (useful for testing)
 * @private
 */
export function _clearKeysCache(): void {
  allKeysCache = null;
}

/**
 * Get translated category name
 *
 * For predefined categories, returns the translated name based on the category ID.
 * For custom categories, returns the original name.
 *
 * @param category - Category object with id, name, and type
 * @returns Translated category name or original name for custom categories
 *
 * @example
 * getCategoryName({ id: 'cat-food', name: 'Food', type: 'predefined' }) // Returns "Comida" in Spanish
 * getCategoryName({ id: 'custom-123', name: 'Mi Categoría', type: 'custom' }) // Returns "Mi Categoría"
 */
export function getCategoryName(category: { id: string; name: string; type: 'predefined' | 'custom' }): string {
  // For custom categories, return the original name
  if (category.type === 'custom') {
    return category.name;
  }

  // For predefined categories, extract the key from the ID (e.g., 'cat-food' → 'food')
  const categoryKey = category.id.replace(/^cat-/, '');
  const translationKey = `categories.names.${categoryKey}`;

  // Get current language
  const currentLang = getCurrentLanguage();

  // Try to get translation
  const translation = getNestedValue(translations[currentLang], translationKey);
  if (translation) return translation;

  // Fallback to English if not the current language
  if (currentLang !== 'en') {
    const englishTranslation = getNestedValue(translations.en, translationKey);
    if (englishTranslation) return englishTranslation;
  }

  // If no translation found, return the original name
  return category.name;
}
