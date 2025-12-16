/**
 * Wallet Store - Manage wallet CRUD operations and balance calculations
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 180-327
 */

import { writable, derived, get } from 'svelte/store';
import type { Readable } from 'svelte/store';
import type { Wallet } from '$lib/models/wallet';
import { WalletSchema } from '$lib/models/wallet';
import { ValidationError, NotFoundError } from '$lib/models/errors';
import { generateUUID } from '$lib/utils/uuid';
import { storageService } from '$lib/services/storage';

/**
 * Input types for wallet operations
 */
export interface CreateWalletInput {
  name: string;
}

export interface UpdateWalletInput {
  name?: string;
}

/**
 * Internal writable stores
 */
const walletsStore = writable<Wallet[]>([]);
const isLoadingStore = writable<boolean>(false);
const errorStore = writable<string | null>(null);

/**
 * Initialize wallets from storage
 */
function initializeWallets(): void {
  try {
    const storedWallets = storageService.getWallets();
    walletsStore.set(storedWallets);
  } catch (error) {
    errorStore.set(`Failed to load wallets: ${(error as Error).message}`);
  }
}

/**
 * Persist wallets to storage
 */
function persistWallets(wallets: Wallet[]): void {
  try {
    storageService.saveWallets(wallets);
  } catch (error) {
    errorStore.set(`Failed to save wallets: ${(error as Error).message}`);
    throw error;
  }
}

/**
 * Validate unique wallet name among active wallets
 */
function validateUniqueName(name: string, excludeId?: string): void {
  const wallets = get(walletsStore);
  const isDuplicate = wallets.some(
    w => w.deletedAt === null && w.name === name && w.id !== excludeId
  );

  if (isDuplicate) {
    throw new ValidationError(`Wallet name "${name}" already exists`, 'name');
  }
}

/**
 * Validate wallet name format
 */
function validateWalletName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new ValidationError('Wallet name is required', 'name');
  }
  if (name.length > 100) {
    throw new ValidationError('Wallet name must be 100 characters or less', 'name');
  }
}

/**
 * Create wallet object
 */
function createWalletObject(name: string): Wallet {
  return {
    id: generateUUID(),
    name: name.trim(),
    balance: 0,
    createdAt: new Date(),
    deletedAt: null
  };
}

/**
 * Create a new wallet
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 222-239
 */
async function create(data: CreateWalletInput): Promise<Wallet> {
  isLoadingStore.set(true);
  errorStore.set(null);

  try {
    validateWalletName(data.name);
    validateUniqueName(data.name);

    const newWallet = createWalletObject(data.name);
    WalletSchema.parse(newWallet);

    const wallets = get(walletsStore);
    const updatedWallets = [...wallets, newWallet];
    walletsStore.set(updatedWallets);
    persistWallets(updatedWallets);

    return newWallet;
  } catch (error) {
    errorStore.set((error as Error).message);
    throw error;
  } finally {
    isLoadingStore.set(false);
  }
}

/**
 * Validate and get updated wallet name
 */
function validateAndGetName(currentName: string, newName: string | undefined, id: string): string {
  if (newName === undefined) return currentName;

  validateWalletName(newName);
  validateUniqueName(newName, id);
  return newName.trim();
}

/**
 * Update wallet name
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 242-257
 */
async function update(id: string, data: UpdateWalletInput): Promise<Wallet> {
  isLoadingStore.set(true);
  errorStore.set(null);

  try {
    const wallets = get(walletsStore);
    const walletIndex = wallets.findIndex(w => w.id === id && w.deletedAt === null);

    if (walletIndex === -1) {
      throw new NotFoundError('Wallet not found', 'Wallet', id);
    }

    const wallet = wallets[walletIndex];
    const updatedName = validateAndGetName(wallet.name, data.name, id);

    const updatedWallet: Wallet = { ...wallet, name: updatedName };
    const updatedWallets = [...wallets];
    updatedWallets[walletIndex] = updatedWallet;

    walletsStore.set(updatedWallets);
    persistWallets(updatedWallets);

    return updatedWallet;
  } catch (error) {
    errorStore.set((error as Error).message);
    throw error;
  } finally {
    isLoadingStore.set(false);
  }
}

/**
 * Soft delete a wallet
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 260-283
 */
async function softDelete(id: string): Promise<void> {
  isLoadingStore.set(true);
  errorStore.set(null);

  try {
    const wallets = get(walletsStore);
    const walletIndex = wallets.findIndex(w => w.id === id && w.deletedAt === null);

    if (walletIndex === -1) {
      throw new NotFoundError('Wallet not found', 'Wallet', id);
    }

    // Soft delete wallet
    const updatedWallet: Wallet = {
      ...wallets[walletIndex],
      deletedAt: new Date()
    };

    const updatedWallets = [...wallets];
    updatedWallets[walletIndex] = updatedWallet;
    walletsStore.set(updatedWallets);
    persistWallets(updatedWallets);
  } catch (error) {
    errorStore.set((error as Error).message);
    throw error;
  } finally {
    isLoadingStore.set(false);
  }
}

/**
 * Get wallet by ID (includes soft-deleted)
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 286-291
 */
function getById(id: string): Wallet | undefined {
  const wallets = get(walletsStore);
  return wallets.find(w => w.id === id);
}

/**
 * Get balance for a wallet by calculating from transactions
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 294-308
 * @see specs/001-personal-finance-tracker/data-model.md lines 337-355
 */
function getBalance(id: string): number {
  // Get all transactions from storage to calculate balance
  const transactions = storageService.getTransactions();
  const walletTransactions = transactions.filter(t => t.walletId === id);

  return walletTransactions.reduce((balance, t) => {
    if (t.type === 'income') {
      return balance + t.amount;
    } else {
      return balance - t.amount;
    }
  }, 0);
}

/**
 * Enrich wallets with calculated balances
 */
function enrichWalletsWithBalances(wallets: Wallet[]): Wallet[] {
  return wallets.map(w => ({
    ...w,
    balance: getBalance(w.id)
  }));
}

/**
 * Derived store: Active wallets only (excludes soft-deleted)
 */
const wallets = derived(walletsStore, $wallets =>
  enrichWalletsWithBalances($wallets.filter(w => w.deletedAt === null))
);

/**
 * Derived store: All wallets (includes soft-deleted)
 */
const allWallets = derived(walletsStore, $wallets =>
  enrichWalletsWithBalances($wallets)
);

/**
 * Derived store: Total balance across all active wallets
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 313-327
 */
const totalBalance = derived(wallets, $wallets => {
  return $wallets.reduce((total, wallet) => total + getBalance(wallet.id), 0);
});

/**
 * Initialize store on module load
 */
initializeWallets();

/**
 * Wallet Store Interface
 */
export interface WalletStore {
  wallets: Readable<Wallet[]>;
  allWallets: Readable<Wallet[]>;
  isLoading: Readable<boolean>;
  error: Readable<string | null>;
  totalBalance: Readable<number>;
  create: (data: CreateWalletInput) => Promise<Wallet>;
  update: (id: string, data: UpdateWalletInput) => Promise<Wallet>;
  softDelete: (id: string) => Promise<void>;
  getById: (id: string) => Wallet | undefined;
  getBalance: (id: string) => number;
}

/**
 * Exported Wallet Store
 */
export const walletStore: WalletStore = {
  wallets,
  allWallets,
  isLoading: isLoadingStore,
  error: errorStore,
  totalBalance,
  create,
  update,
  softDelete,
  getById,
  getBalance
};
