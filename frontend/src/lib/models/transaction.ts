import { z } from 'zod';

/**
 * Transaction entity representing a financial transaction
 *
 * @see specs/001-personal-finance-tracker/data-model.md lines 19-31
 */
export interface Transaction {
  id: string;                    // UUID v4
  date: Date;                    // Transaction date (ISO 8601 string in storage)
  amount: number;                // Monetary amount (can be negative, cannot be zero)
  type: 'income' | 'expense';    // Transaction type
  categoryId: string;            // FK to Category.id
  walletId: string;              // FK to Wallet.id
  note?: string;                 // Optional user note
  createdAt: Date;               // Timestamp of creation (ISO 8601 string)
  updatedAt: Date;               // Timestamp of last modification (ISO 8601 string)
}

/**
 * Zod validation schema for Transaction
 *
 * @see specs/001-personal-finance-tracker/data-model.md lines 514-531
 * @see specs/001-personal-finance-tracker/data-model.md lines 34-42
 */
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  date: z.coerce.date(),
  amount: z.number().refine(val => val !== 0, {
    message: 'Amount cannot be zero'
  }),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().min(1),
  walletId: z.string().min(1),
  note: z.string().max(500).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

/**
 * Type helper for validating transaction input
 */
export type TransactionInput = z.infer<typeof TransactionSchema>;
