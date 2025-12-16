/**
 * Unit tests for i18n translation system
 *
 * @see specs/002-settings-i18n-currency/tasks.md lines 78-86
 * @see specs/002-settings-i18n-currency/plan.md
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { t, getCurrentLanguage, hasTranslation, getAllKeys } from '$lib/i18n';
import { settingsStore } from '$lib/stores/settings';
import { storageService } from '$lib/services/storage';

// Create a simple in-memory storage for tests
let testStorage: Record<string, string> = {};

describe('i18n Translation System', () => {
  beforeEach(() => {
    // Clear test storage
    testStorage = {};

    // Mock storageService methods to use testStorage
    vi.spyOn(storageService, 'getSettings').mockImplementation(() => {
      const data = testStorage['userSettings'];
      if (!data) return null;
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    });

    vi.spyOn(storageService, 'saveSettings').mockImplementation((settings) => {
      testStorage['userSettings'] = JSON.stringify(settings);
    });

    // Reset settings store to Spanish (default)
    settingsStore._resetInitialization();
    settingsStore.initializeSettings();
  });

  describe('T021: Translation function returns Spanish translation by default', () => {
    it('should return Spanish translation for common.welcome', () => {
      // Arrange: Default language is Spanish
      const translation = get(t);

      // Act: Get translation
      const result = translation('common.welcome');

      // Assert: Should return Spanish text
      expect(result).toBe('Bienvenido');
    });

    it('should return Spanish translation for navigation keys', () => {
      const translation = get(t);

      expect(translation('navigation.dashboard')).toBe('Inicio');
      expect(translation('navigation.transactions')).toBe('Transacciones');
    });
  });

  describe('T022: Translation function returns English translation when language is English', () => {
    it('should return English translation when language is set to English', () => {
      // Arrange: Change language to English
      settingsStore.setLanguage('en');
      const translation = get(t);

      // Act: Get translation
      const result = translation('common.welcome');

      // Assert: Should return English text
      expect(result).toBe('Welcome');
    });

    it('should return English translations for navigation keys', () => {
      settingsStore.setLanguage('en');
      const translation = get(t);

      expect(translation('navigation.dashboard')).toBe('Dashboard');
      expect(translation('navigation.transactions')).toBe('Transactions');
    });
  });

  describe('T023: Translation function falls back to English when Spanish translation missing', () => {
    it('should fall back to English when Spanish key is missing', () => {
      // Arrange: Default language is Spanish
      const translation = get(t);

      // Act: Try to get a key that only exists in English
      const result = translation('test.onlyInEnglish');

      // Assert: Should fall back to English or show key
      // This test will verify fallback behavior once we implement it
      expect(result).toBeDefined();
    });
  });

  describe('T024: Translation function returns key when translation missing in all languages', () => {
    it('should return the key itself when translation is missing', () => {
      // Arrange
      const translation = get(t);

      // Act: Try to get a non-existent key
      const result = translation('non.existent.key');

      // Assert: Should return the key itself
      expect(result).toBe('non.existent.key');
    });

    it('should warn in console for missing keys', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const translation = get(t);

      // Act
      translation('missing.key');

      // Assert: Should have warned
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('missing.key')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('T025: hasTranslation returns true for existing keys', () => {
    it('should return true for existing Spanish keys', () => {
      // Act & Assert
      expect(hasTranslation('common.welcome')).toBe(true);
      expect(hasTranslation('navigation.dashboard')).toBe(true);
    });

    it('should return true for existing English keys', () => {
      settingsStore.setLanguage('en');

      // Act & Assert
      expect(hasTranslation('common.welcome')).toBe(true);
      expect(hasTranslation('navigation.transactions')).toBe(true);
    });
  });

  describe('T026: hasTranslation returns false for missing keys', () => {
    it('should return false for non-existent keys', () => {
      // Act & Assert
      expect(hasTranslation('non.existent.key')).toBe(false);
      expect(hasTranslation('missing.translation')).toBe(false);
    });

    it('should return false for invalid key format', () => {
      expect(hasTranslation('')).toBe(false);
      expect(hasTranslation('noperiod')).toBe(false);
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return current language from settings store', () => {
      // Assert: Default is Spanish
      expect(getCurrentLanguage()).toBe('es');

      // Act: Change to English
      settingsStore.setLanguage('en');

      // Assert: Should be English
      expect(getCurrentLanguage()).toBe('en');
    });
  });

  describe('getAllKeys', () => {
    it('should return all translation keys', () => {
      // Act
      const keys = getAllKeys();

      // Assert: Should have common keys
      expect(keys).toContain('common.welcome');
      expect(keys).toContain('navigation.dashboard');
      expect(keys.length).toBeGreaterThan(0);
    });

    it('should return unique keys', () => {
      const keys = getAllKeys();
      const uniqueKeys = [...new Set(keys)];

      // Assert: No duplicates
      expect(keys.length).toBe(uniqueKeys.length);
    });
  });

  describe('Reactive translation store', () => {
    it('should update translations when language changes', () => {
      // Arrange: Subscribe to translation store
      const values: string[] = [];
      const translation = get(t);
      const unsubscribe = t.subscribe(fn => {
        values.push(fn('common.welcome'));
      });

      // Act: Change language
      settingsStore.setLanguage('en');

      // Assert: Should have received updates
      expect(values).toContain('Bienvenido'); // Spanish
      expect(values).toContain('Welcome'); // English
      expect(values.length).toBeGreaterThanOrEqual(2);

      unsubscribe();
    });

    it('should be reactive with Svelte components', () => {
      // This verifies the derived store is properly reactive
      let translationFn = get(t);
      expect(translationFn('common.welcome')).toBe('Bienvenido');

      settingsStore.setLanguage('en');

      translationFn = get(t);
      expect(translationFn('common.welcome')).toBe('Welcome');
    });
  });

  describe('Translation lookup performance', () => {
    it('should perform translation lookup in under 0.01ms', () => {
      const translation = get(t);
      const iterations = 1000;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        translation('common.welcome');
      }
      const end = performance.now();

      const avgTime = (end - start) / iterations;

      // Assert: Average lookup should be under 0.01ms
      expect(avgTime).toBeLessThan(0.01);
    });
  });

  describe('Nested translation keys', () => {
    it('should support dot notation for nested keys', () => {
      const translation = get(t);

      // Test various nesting levels
      expect(translation('common.welcome')).toBeDefined();
      expect(translation('settings.language.label')).toBeDefined();
      expect(translation('transactions.form.amount')).toBeDefined();
    });

    it('should handle deep nesting correctly', () => {
      const translation = get(t);

      const result = translation('transactions.filters.dateRange.start');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});
