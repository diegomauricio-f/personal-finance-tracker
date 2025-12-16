/**
 * LocalStorage abstraction service for offline-first data persistence
 *
 * @see specs/001-personal-finance-tracker/data-model.md lines 224-271
 * @see specs/001-personal-finance-tracker/research.md lines 86-113
 */

import type { Transaction } from '$lib/models/transaction';
import type { Wallet } from '$lib/models/wallet';
import type { Category } from '$lib/models/category';
import type { UserSettings } from '$lib/i18n/types';
import { StorageError } from '$lib/models/errors';

/**
 * Storage keys for LocalStorage
 */
const STORAGE_KEYS = {
  TRANSACTIONS: 'finance-tracker:transactions',
  WALLETS: 'finance-tracker:wallets',
  CATEGORIES: 'finance-tracker:categories',
  SETTINGS: 'userSettings',
  VERSION: 'finance-tracker:version'
} as const;

/**
 * Current schema version for migrations
 *
 * @see specs/001-personal-finance-tracker/data-model.md lines 447-477
 */
const CURRENT_VERSION = '1.0.0';

/**
 * Interface for serialized storage data (dates as ISO strings)
 */
interface SerializedTransaction extends Omit<Transaction, 'date' | 'createdAt' | 'updatedAt'> {
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface SerializedWallet extends Omit<Wallet, 'createdAt' | 'deletedAt'> {
  createdAt: string;
  deletedAt: string | null;
}

interface SerializedCategory extends Omit<Category, 'createdAt' | 'deletedAt'> {
  createdAt: string;
  deletedAt: string | null;
}

/**
 * LocalStorage Service
 * Provides offline-first data persistence with schema versioning and error handling
 */
class StorageService {
  /**
   * Initialize storage and run migrations if needed
   *
   * @see specs/001-personal-finance-tracker/data-model.md lines 447-477
   */
  initialize(): void {
    try {
      const currentVersion = this.getVersion();
      if (currentVersion !== CURRENT_VERSION) {
        this.migrate(currentVersion, CURRENT_VERSION);
      }
    } catch (error) {
      throw new StorageError(`Failed to initialize storage: ${(error as Error).message}`);
    }
  }

  /**
   * Get current schema version
   */
  private getVersion(): string {
    return localStorage.getItem(STORAGE_KEYS.VERSION) || '1.0.0';
  }

  /**
   * Set schema version
   */
  private setVersion(version: string): void {
    localStorage.setItem(STORAGE_KEYS.VERSION, version);
  }

  /**
   * Migrate data from one version to another
   *
   * @see specs/001-personal-finance-tracker/data-model.md lines 447-477
   * @see specs/001-personal-finance-tracker/quickstart.md lines 517-523
   */
  private migrate(fromVersion: string, toVersion: string): void {
    // Migration logic will be implemented when schema changes are needed
    // For now, just update the version
    console.log(`Migrating from version ${fromVersion} to ${toVersion}`);
    this.setVersion(toVersion);
  }

  /**
   * Serialize data with Date handling
   * Converts Date objects to ISO 8601 strings
   *
   * @see specs/001-personal-finance-tracker/data-model.md lines 236-271
   */
  private serialize<T>(data: T[]): string {
    return JSON.stringify(data);
  }

  /**
   * Deserialize data with Date handling
   * Converts ISO 8601 strings back to Date objects
   *
   * @see specs/001-personal-finance-tracker/data-model.md lines 236-271
   */
  private deserializeTransactions(data: string): Transaction[] {
    const parsed: SerializedTransaction[] = JSON.parse(data);
    return parsed.map(t => ({
      ...t,
      date: new Date(t.date),
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt)
    }));
  }

  private deserializeWallets(data: string): Wallet[] {
    const parsed: SerializedWallet[] = JSON.parse(data);
    return parsed.map(w => ({
      ...w,
      createdAt: new Date(w.createdAt),
      deletedAt: w.deletedAt ? new Date(w.deletedAt) : null
    }));
  }

  private deserializeCategories(data: string): Category[] {
    const parsed: SerializedCategory[] = JSON.parse(data);
    return parsed.map(c => ({
      ...c,
      createdAt: new Date(c.createdAt),
      deletedAt: c.deletedAt ? new Date(c.deletedAt) : null
    }));
  }

  /**
   * Handle storage quota exceeded error
   *
   * @see specs/001-personal-finance-tracker/research.md lines 107-112
   * @see specs/001-personal-finance-tracker/quickstart.md lines 548-556
   */
  private handleQuotaExceeded(key: string): void {
    throw new StorageError(
      `Storage quota exceeded while saving ${key}. Please free up some space or delete old data.`
    );
  }

  /**
   * Save data to LocalStorage with error handling
   */
  private saveToStorage(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.handleQuotaExceeded(key);
      }
      throw new StorageError(`Failed to save ${key}: ${(error as Error).message}`);
    }
  }

  /**
   * Get data from LocalStorage
   */
  private getFromStorage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      throw new StorageError(`Failed to get ${key}: ${(error as Error).message}`);
    }
  }

  // === Transaction Methods ===

  /**
   * Save transactions to LocalStorage
   *
   * @see specs/001-personal-finance-tracker/research.md lines 86-113
   */
  saveTransactions(transactions: Transaction[]): void {
    const serialized = this.serialize(transactions);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, serialized);
  }

  /**
   * Get transactions from LocalStorage
   *
   * @see specs/001-personal-finance-tracker/research.md lines 86-113
   */
  getTransactions(): Transaction[] {
    const data = this.getFromStorage(STORAGE_KEYS.TRANSACTIONS);
    if (!data) {
      return [];
    }
    return this.deserializeTransactions(data);
  }

  // === Wallet Methods ===

  /**
   * Save wallets to LocalStorage
   *
   * @see specs/001-personal-finance-tracker/research.md lines 86-113
   */
  saveWallets(wallets: Wallet[]): void {
    const serialized = this.serialize(wallets);
    this.saveToStorage(STORAGE_KEYS.WALLETS, serialized);
  }

  /**
   * Get wallets from LocalStorage
   *
   * @see specs/001-personal-finance-tracker/research.md lines 86-113
   */
  getWallets(): Wallet[] {
    const data = this.getFromStorage(STORAGE_KEYS.WALLETS);
    if (!data) {
      return [];
    }
    return this.deserializeWallets(data);
  }

  // === Category Methods ===

  /**
   * Save custom categories to LocalStorage
   * Note: Predefined categories are not stored, only custom ones
   *
   * @see specs/001-personal-finance-tracker/research.md lines 86-113
   * @see specs/001-personal-finance-tracker/data-model.md lines 231
   */
  saveCategories(categories: Category[]): void {
    const serialized = this.serialize(categories);
    this.saveToStorage(STORAGE_KEYS.CATEGORIES, serialized);
  }

  /**
   * Get custom categories from LocalStorage
   * Note: This only returns custom categories, predefined ones are in constants
   *
   * @see specs/001-personal-finance-tracker/research.md lines 86-113
   * @see specs/001-personal-finance-tracker/data-model.md lines 231
   */
  getCategories(): Category[] {
    const data = this.getFromStorage(STORAGE_KEYS.CATEGORIES);
    if (!data) {
      return [];
    }
    return this.deserializeCategories(data);
  }

  // === Settings Methods ===

  /**
   * Save user settings to LocalStorage
   *
   * @see specs/002-settings-i18n-currency/data-model.md
   */
  saveSettings(settings: UserSettings): void {
    const serialized = JSON.stringify(settings);
    this.saveToStorage(STORAGE_KEYS.SETTINGS, serialized);
  }

  /**
   * Get user settings from LocalStorage
   * Returns null if no settings are stored
   *
   * @see specs/002-settings-i18n-currency/data-model.md
   */
  getSettings(): UserSettings | null {
    const data = this.getFromStorage(STORAGE_KEYS.SETTINGS);
    if (!data) {
      return null;
    }
    try {
      return JSON.parse(data) as UserSettings;
    } catch (error) {
      throw new StorageError(`Failed to parse settings: ${(error as Error).message}`);
    }
  }

  /**
   * Clear all data from LocalStorage
   * Useful for testing or data reset
   */
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

/**
 * Singleton instance of StorageService
 */
export const storageService = new StorageService();
