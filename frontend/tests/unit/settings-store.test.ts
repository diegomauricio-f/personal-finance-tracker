/**
 * Unit tests for settings store
 *
 * @see specs/002-settings-i18n-currency/tasks.md lines 45-62
 * @see specs/002-settings-i18n-currency/plan.md
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { settingsStore } from '$lib/stores/settings';
import { storageService } from '$lib/services/storage';
import type { UserSettings } from '$lib/i18n/types';

// Create a simple in-memory storage for tests
let testStorage: Record<string, string> = {};

describe('Settings Store', () => {
  beforeEach(() => {
    // Clear test storage
    testStorage = {};

    // Mock storageService methods to use testStorage
    vi.spyOn(storageService, 'getSettings').mockImplementation(() => {
      const data = testStorage['userSettings'];
      if (!data) return null;
      try {
        return JSON.parse(data) as UserSettings;
      } catch {
        return null;
      }
    });

    vi.spyOn(storageService, 'saveSettings').mockImplementation((settings: UserSettings) => {
      testStorage['userSettings'] = JSON.stringify(settings);
    });

    // Reset store initialization state for test isolation
    settingsStore._resetInitialization();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('T009: Initialization with defaults', () => {
    it('should initialize with Spanish language and Bs. currency when no stored settings', () => {
      // Arrange: No settings in localStorage (cleared in beforeEach)

      // Act: Initialize the store
      settingsStore.initializeSettings();
      const settings = get(settingsStore);

      // Assert: Should have default values
      expect(settings.language).toBe('es');
      expect(settings.currency).toBe('Bs.');
    });

    it('should use default settings when localStorage is empty', () => {
      // Arrange: Ensure no stored settings (testStorage is empty from beforeEach)

      // Act
      settingsStore.initializeSettings();
      const settings = get(settingsStore);

      // Assert
      expect(settings).toEqual({ language: 'es', currency: 'Bs.' });
    });
  });

  describe('T010: Load valid settings from LocalStorage', () => {
    it('should load valid settings from LocalStorage', () => {
      // Arrange: Store valid settings
      const validSettings: UserSettings = { language: 'en', currency: '$' };
      storageService.saveSettings(validSettings);

      // Act: Initialize store (should load from storage)
      settingsStore.initializeSettings();
      const settings = get(settingsStore);

      // Assert: Should load the stored settings
      expect(settings.language).toBe('en');
      expect(settings.currency).toBe('$');
    });

    it('should correctly load Spanish and Bs. settings', () => {
      // Arrange
      const validSettings: UserSettings = { language: 'es', currency: 'Bs.' };
      storageService.saveSettings(validSettings);

      // Act
      settingsStore.initializeSettings();
      const settings = get(settingsStore);

      // Assert
      expect(settings).toEqual({ language: 'es', currency: 'Bs.' });
    });
  });

  describe('T011: Reset to defaults when corrupted data', () => {
    it('should reset to defaults when LocalStorage has corrupted JSON', () => {
      // Arrange: Store invalid JSON
      localStorage.setItem('userSettings', '{invalid json}');

      // Act
      settingsStore.initializeSettings();
      const settings = get(settingsStore);

      // Assert: Should fall back to defaults
      expect(settings.language).toBe('es');
      expect(settings.currency).toBe('Bs.');
    });

    it('should reset to defaults when settings have invalid language', () => {
      // Arrange: Store settings with invalid language
      localStorage.setItem('userSettings', JSON.stringify({ language: 'fr', currency: 'Bs.' }));

      // Act
      settingsStore.initializeSettings();
      const settings = get(settingsStore);

      // Assert: Should fall back to defaults
      expect(settings.language).toBe('es');
      expect(settings.currency).toBe('Bs.');
    });

    it('should reset to defaults when settings have invalid currency', () => {
      // Arrange: Store settings with invalid currency
      localStorage.setItem('userSettings', JSON.stringify({ language: 'es', currency: '€' }));

      // Act
      settingsStore.initializeSettings();
      const settings = get(settingsStore);

      // Assert: Should fall back to defaults
      expect(settings.language).toBe('es');
      expect(settings.currency).toBe('Bs.');
    });
  });

  describe('T012: Validate and reject invalid language codes', () => {
    it('should reject invalid language codes', () => {
      // Arrange
      settingsStore.initializeSettings();

      // Act & Assert: Should throw or reject invalid language
      expect(() => {
        settingsStore.setLanguage('fr' as any);
      }).toThrow();
    });

    it('should accept valid language code "es"', () => {
      // Arrange
      settingsStore.initializeSettings();

      // Act
      settingsStore.setLanguage('es');
      const settings = get(settingsStore);

      // Assert
      expect(settings.language).toBe('es');
    });

    it('should accept valid language code "en"', () => {
      // Arrange
      settingsStore.initializeSettings();

      // Act
      settingsStore.setLanguage('en');
      const settings = get(settingsStore);

      // Assert
      expect(settings.language).toBe('en');
    });
  });

  describe('T013: Validate and reject invalid currency codes', () => {
    it('should reject invalid currency codes', () => {
      // Arrange
      settingsStore.initializeSettings();

      // Act & Assert: Should throw or reject invalid currency
      expect(() => {
        settingsStore.setCurrency('€' as any);
      }).toThrow();
    });

    it('should accept valid currency code "Bs."', () => {
      // Arrange
      settingsStore.initializeSettings();

      // Act
      settingsStore.setCurrency('Bs.');
      const settings = get(settingsStore);

      // Assert
      expect(settings.currency).toBe('Bs.');
    });

    it('should accept valid currency code "$"', () => {
      // Arrange
      settingsStore.initializeSettings();

      // Act
      settingsStore.setCurrency('$');
      const settings = get(settingsStore);

      // Assert
      expect(settings.currency).toBe('$');
    });
  });

  describe('T014: Auto-persistence to LocalStorage', () => {
    it('should automatically persist language changes to LocalStorage', () => {
      // Arrange
      settingsStore.initializeSettings();

      // Act: Change language
      settingsStore.setLanguage('en');

      // Assert: Check localStorage was updated
      const stored = storageService.getSettings();
      expect(stored?.language).toBe('en');
    });

    it('should automatically persist currency changes to LocalStorage', () => {
      // Arrange
      settingsStore.initializeSettings();

      // Act: Change currency
      settingsStore.setCurrency('$');

      // Assert: Check localStorage was updated
      const stored = storageService.getSettings();
      expect(stored?.currency).toBe('$');
    });

    it('should persist both language and currency changes', () => {
      // Arrange
      settingsStore.initializeSettings();

      // Act: Change both settings
      settingsStore.setLanguage('en');
      settingsStore.setCurrency('$');

      // Assert: Check localStorage has both changes
      const stored = storageService.getSettings();
      expect(stored).toEqual({ language: 'en', currency: '$' });
    });
  });

  describe('T015: Reset method', () => {
    it('should reset to default values when reset() is called', () => {
      // Arrange: Change settings to non-default values
      settingsStore.initializeSettings();
      settingsStore.setLanguage('en');
      settingsStore.setCurrency('$');

      // Act: Reset
      settingsStore.reset();
      const settings = get(settingsStore);

      // Assert: Should be back to defaults
      expect(settings.language).toBe('es');
      expect(settings.currency).toBe('Bs.');
    });

    it('should persist default values to LocalStorage after reset', () => {
      // Arrange
      settingsStore.initializeSettings();
      settingsStore.setLanguage('en');

      // Act: Reset
      settingsStore.reset();

      // Assert: Check localStorage has defaults
      const stored = storageService.getSettings();
      expect(stored).toEqual({ language: 'es', currency: 'Bs.' });
    });
  });

  describe('Store subscription', () => {
    it('should notify subscribers when language changes', () => {
      // Arrange
      settingsStore.initializeSettings();
      const values: UserSettings[] = [];
      const unsubscribe = settingsStore.subscribe(value => {
        values.push(value);
      });

      // Act
      settingsStore.setLanguage('en');

      // Assert: Should have initial value and updated value
      expect(values.length).toBeGreaterThanOrEqual(2);
      expect(values[values.length - 1].language).toBe('en');

      // Cleanup
      unsubscribe();
    });

    it('should notify subscribers when currency changes', () => {
      // Arrange
      settingsStore.initializeSettings();
      const values: UserSettings[] = [];
      const unsubscribe = settingsStore.subscribe(value => {
        values.push(value);
      });

      // Act
      settingsStore.setCurrency('$');

      // Assert: Should have initial value and updated value
      expect(values.length).toBeGreaterThanOrEqual(2);
      expect(values[values.length - 1].currency).toBe('$');

      // Cleanup
      unsubscribe();
    });
  });
});
