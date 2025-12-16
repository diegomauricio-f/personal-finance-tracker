/**
 * Transaction Store - Manage transaction CRUD operations, filtering, and queries
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 13-178
 */

import { writable, derived, get } from 'svelte/store';
import type { Readable } from 'svelte/store';
import type { Transaction } from '$lib/models/transaction';
import { TransactionSchema } from '$lib/models/transaction';
import { ValidationError, NotFoundError } from '$lib/models/errors';
import { generateUUID } from '$lib/utils/uuid';
import { storageService } from '$lib/services/storage';
import { walletStore } from './wallets';
import { categoryStore } from './categories';

/**
 * Input types for transaction operations
 */
export interface CreateTransactionInput {
  date: Date;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  walletId: string;
  note?: string;
}

export interface UpdateTransactionInput {
  date?: Date;
  amount?: number;
  type?: 'income' | 'expense';
  categoryId?: string;
  walletId?: string;
  note?: string;
}

export interface TransactionFilters {
  walletId?: string;
  categoryId?: string;
  type?: 'income' | 'expense';
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

/**
 * Internal writable stores
 */
const transactionsStore = writable<Transaction[]>([]);
const isLoadingStore = writable<boolean>(false);
const errorStore = writable<string | null>(null);

/**
 * Initialize transactions from storage
 */
function initializeTransactions(): void {
  try {
    const storedTransactions = storageService.getTransactions();
    transactionsStore.set(storedTransactions);
  } catch (error) {
    errorStore.set(`Failed to load transactions: ${(error as Error).message}`);
  }
}

/**
 * Persist transactions to storage
 */
function persistTransactions(transactions: Transaction[]): void {
  try {
    storageService.saveTransactions(transactions);
  } catch (error) {
    errorStore.set(`Failed to save transactions: ${(error as Error).message}`);
    throw error;
  }
}

/**
 * Validate transaction input
 */
function validateTransactionInput(amount: number, walletId: string, categoryId: string): void {
  if (amount === 0) {
    throw new ValidationError('Amount cannot be zero', 'amount');
  }

  const wallet = walletStore.getById(walletId);
  if (!wallet || wallet.deletedAt !== null) {
    throw new ValidationError('Invalid wallet selected', 'walletId');
  }

  const category = categoryStore.getById(categoryId);
  if (!category || category.deletedAt !== null) {
    throw new ValidationError('Invalid category selected', 'categoryId');
  }
}

/**
 * Validate optional amount update
 */
function validateAmountUpdate(amount: number | undefined): void {
  if (amount !== undefined && amount === 0) {
    throw new ValidationError('Amount cannot be zero', 'amount');
  }
}

/**
 * Validate optional wallet update
 */
function validateWalletUpdate(walletId: string | undefined): void {
  if (walletId === undefined) return;

  const wallet = walletStore.getById(walletId);
  if (!wallet || wallet.deletedAt !== null) {
    throw new ValidationError('Invalid wallet selected', 'walletId');
  }
}

/**
 * Validate optional category update
 */
function validateCategoryUpdate(categoryId: string | undefined): void {
  if (categoryId === undefined) return;

  const category = categoryStore.getById(categoryId);
  if (!category || category.deletedAt !== null) {
    throw new ValidationError('Invalid category selected', 'categoryId');
  }
}

/**
 * Build updated transaction from partial data
 */
function buildUpdatedTransaction(
  transaction: Transaction,
  data: UpdateTransactionInput
): Transaction {
  return {
    ...transaction,
    date: data.date ?? transaction.date,
    amount: data.amount ?? transaction.amount,
    type: data.type ?? transaction.type,
    categoryId: data.categoryId ?? transaction.categoryId,
    walletId: data.walletId ?? transaction.walletId,
    note: data.note !== undefined ? data.note : transaction.note,
    updatedAt: new Date()
  };
}

/**
 * Create a new transaction
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 73-93
 */
async function create(data: CreateTransactionInput): Promise<Transaction> {
  isLoadingStore.set(true);
  errorStore.set(null);

  try {
    // Validate input
    validateTransactionInput(data.amount, data.walletId, data.categoryId);

    // Create transaction
    const now = new Date();
    const newTransaction: Transaction = {
      id: generateUUID(),
      date: data.date,
      amount: data.amount,
      type: data.type,
      categoryId: data.categoryId,
      walletId: data.walletId,
      note: data.note,
      createdAt: now,
      updatedAt: now
    };

    // Validate with Zod schema
    TransactionSchema.parse(newTransaction);

    // Add to store and persist
    const transactions = get(transactionsStore);
    const updatedTransactions = [...transactions, newTransaction];
    transactionsStore.set(updatedTransactions);
    persistTransactions(updatedTransactions);

    return newTransaction;
  } catch (error) {
    errorStore.set((error as Error).message);
    throw error;
  } finally {
    isLoadingStore.set(false);
  }
}

/**
 * Update an existing transaction
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 96-115
 */
async function update(id: string, data: UpdateTransactionInput): Promise<Transaction> {
  isLoadingStore.set(true);
  errorStore.set(null);

  try {
    const transactions = get(transactionsStore);
    const transactionIndex = transactions.findIndex(t => t.id === id);

    if (transactionIndex === -1) {
      throw new NotFoundError('Transaction not found', 'Transaction', id);
    }

    validateAmountUpdate(data.amount);
    validateWalletUpdate(data.walletId);
    validateCategoryUpdate(data.categoryId);

    const updatedTransaction = buildUpdatedTransaction(transactions[transactionIndex], data);
    TransactionSchema.parse(updatedTransaction);

    const updatedTransactions = [...transactions];
    updatedTransactions[transactionIndex] = updatedTransaction;
    transactionsStore.set(updatedTransactions);
    persistTransactions(updatedTransactions);

    return updatedTransaction;
  } catch (error) {
    errorStore.set((error as Error).message);
    throw error;
  } finally {
    isLoadingStore.set(false);
  }
}

/**
 * Hard delete a transaction
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 118-133
 */
async function deleteTransaction(id: string): Promise<void> {
  isLoadingStore.set(true);
  errorStore.set(null);

  try {
    const transactions = get(transactionsStore);
    const transactionIndex = transactions.findIndex(t => t.id === id);

    if (transactionIndex === -1) {
      throw new NotFoundError('Transaction not found', 'Transaction', id);
    }

    // Remove transaction
    const updatedTransactions = transactions.filter(t => t.id !== id);
    transactionsStore.set(updatedTransactions);
    persistTransactions(updatedTransactions);
  } catch (error) {
    errorStore.set((error as Error).message);
    throw error;
  } finally {
    isLoadingStore.set(false);
  }
}

/**
 * Get transaction by ID
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 136-141
 */
function getById(id: string): Transaction | undefined {
  const transactions = get(transactionsStore);
  return transactions.find(t => t.id === id);
}

/**
 * Get transactions by wallet
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 144-149
 */
function getByWallet(walletId: string): Transaction[] {
  const transactions = get(transactionsStore);
  return transactions
    .filter(t => t.walletId === walletId)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Get transactions by category
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 152-157
 */
function getByCategory(categoryId: string): Transaction[] {
  const transactions = get(transactionsStore);
  return transactions
    .filter(t => t.categoryId === categoryId)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Get transactions by date range
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 160-165
 */
function getByDateRange(start: Date, end: Date): Transaction[] {
  const transactions = get(transactionsStore);
  return transactions
    .filter(t => t.date >= start && t.date <= end)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Filter transactions with multiple criteria
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 168-177
 */
function filter(filters: TransactionFilters): Transaction[] {
  const transactions = get(transactionsStore);
  let filtered = transactions;

  if (filters.walletId) {
    filtered = filtered.filter(t => t.walletId === filters.walletId);
  }

  if (filters.categoryId) {
    filtered = filtered.filter(t => t.categoryId === filters.categoryId);
  }

  if (filters.type) {
    filtered = filtered.filter(t => t.type === filters.type);
  }

  if (filters.startDate && filters.endDate) {
    filtered = filtered.filter(
      t => t.date >= filters.startDate! && t.date <= filters.endDate!
    );
  }

  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(t =>
      t.note?.toLowerCase().includes(searchLower)
    );
  }

  return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Calculate balance for a wallet based on its transactions
 *
 * @see specs/001-personal-finance-tracker/data-model.md lines 337-355
 */
export function calculateWalletBalance(walletId: string): number {
  const transactions = getByWallet(walletId);
  return transactions.reduce((balance, t) => {
    if (t.type === 'income') {
      return balance + t.amount;
    } else {
      return balance - t.amount;
    }
  }, 0);
}

/**
 * Derived store: All transactions sorted by date descending
 */
const transactions = derived(transactionsStore, $transactions =>
  [...$transactions].sort((a, b) => b.date.getTime() - a.date.getTime())
);

/**
 * Initialize store on module load
 */
initializeTransactions();

/**
 * Transaction Store Interface
 */
export interface TransactionStore {
  transactions: Readable<Transaction[]>;
  isLoading: Readable<boolean>;
  error: Readable<string | null>;
  create: (data: CreateTransactionInput) => Promise<Transaction>;
  update: (id: string, data: UpdateTransactionInput) => Promise<Transaction>;
  delete: (id: string) => Promise<void>;
  getById: (id: string) => Transaction | undefined;
  getByWallet: (walletId: string) => Transaction[];
  getByCategory: (categoryId: string) => Transaction[];
  getByDateRange: (start: Date, end: Date) => Transaction[];
  filter: (filters: TransactionFilters) => Transaction[];
}

/**
 * Exported Transaction Store
 */
export const transactionStore: TransactionStore = {
  transactions,
  isLoading: isLoadingStore,
  error: errorStore,
  create,
  update,
  delete: deleteTransaction,
  getById,
  getByWallet,
  getByCategory,
  getByDateRange,
  filter
};
