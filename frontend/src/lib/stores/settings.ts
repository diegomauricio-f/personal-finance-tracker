/**
 * Settings store for user preferences (language and currency)
 * Implements User Story 3: Persist Settings Across Sessions
 *
 * @see specs/002-settings-i18n-currency/plan.md
 * @see specs/002-settings-i18n-currency/data-model.md
 * @see specs/002-settings-i18n-currency/tasks.md lines 56-62
 */

import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { storageService } from '$lib/services/storage';
import {
  type UserSettings,
  type Language,
  type Currency,
  UserSettingsSchema,
  LanguageSchema,
  CurrencySchema,
  DEFAULT_SETTINGS
} from '$lib/i18n/types';

/**
 * Settings store interface
 */
interface SettingsStore {
  subscribe: Writable<UserSettings>['subscribe'];
  set: Writable<UserSettings>['set'];
  update: Writable<UserSettings>['update'];
  initializeSettings: () => void;
  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
  reset: () => void;
  _resetInitialization: () => void; // For testing only
}

/**
 * Load settings from LocalStorage with validation
 * Returns default settings if no valid settings found
 */
function loadSettings(): UserSettings {
  try {
    const stored = storageService.getSettings();
    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    // Validate stored settings with Zod
    const validated = UserSettingsSchema.parse(stored);
    return validated;
  } catch (error) {
    // If validation fails or any error occurs, return defaults
    console.warn('Failed to load settings, using defaults:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Create the settings store
 */
// eslint-disable-next-line max-lines-per-function
function createSettingsStore(): SettingsStore {
  const { subscribe, set, update } = writable<UserSettings>(DEFAULT_SETTINGS);
  let initialized = false;

  // Helper function to persist settings
  const persistSettings = (settings: UserSettings) => {
    if (initialized) {
      storageService.saveSettings(settings);
    }
  };

  return {
    subscribe,
    set,
    update,

    /**
     * Initialize settings from LocalStorage
     * Should be called on app startup
     */
    initializeSettings: () => {
      const settings = loadSettings();
      initialized = true;
      set(settings);
      // Don't persist here - settings are already loaded from storage
    },

    /**
     * Set the application language
     * Validates the language code before updating
     *
     * @throws {ZodError} If language code is invalid
     */
    setLanguage: (language: Language) => {
      // Validate language with Zod
      const validated = LanguageSchema.parse(language);

      update(current => {
        const newSettings = {
          ...current,
          language: validated
        };
        persistSettings(newSettings);
        return newSettings;
      });
    },

    /**
     * Set the currency display format
     * Validates the currency code before updating
     *
     * @throws {ZodError} If currency code is invalid
     */
    setCurrency: (currency: Currency) => {
      // Validate currency with Zod
      const validated = CurrencySchema.parse(currency);

      update(current => {
        const newSettings = {
          ...current,
          currency: validated
        };
        persistSettings(newSettings);
        return newSettings;
      });
    },

    /**
     * Reset settings to default values
     * (Spanish language, Bs. currency)
     */
    reset: () => {
      set(DEFAULT_SETTINGS);
      persistSettings(DEFAULT_SETTINGS);
    },

    /**
     * Reset initialization state (for testing only)
     * @private
     */
    _resetInitialization: () => {
      initialized = false;
      set(DEFAULT_SETTINGS);
    }
  };
}

/**
 * Singleton settings store instance
 * Auto-persistence is handled within the store methods
 *
 * @see specs/002-settings-i18n-currency/tasks.md line 60
 */
export const settingsStore = createSettingsStore();

/**
 * Sync settings across browser tabs via the storage event
 * When another tab changes LocalStorage 'userSettings', this tab updates its store.
 *
 * @see specs/002-settings-i18n-currency/tasks.md T106
 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key !== 'userSettings' || event.newValue === null) return;

    try {
      const parsed = JSON.parse(event.newValue);
      const validated = UserSettingsSchema.parse(parsed);
      settingsStore.set(validated);
    } catch {
      // Ignore invalid data from other tabs
    }
  });
}
