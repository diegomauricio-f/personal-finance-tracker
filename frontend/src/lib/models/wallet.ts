import { z } from 'zod';

/**
 * Wallet entity representing a financial account or payment source
 *
 * @see specs/001-personal-finance-tracker/data-model.md lines 68-76
 */
export interface Wallet {
  id: string;                    // UUID v4
  name: string;                  // User-defined name
  balance: number;               // Current balance (calculated, not stored)
  createdAt: Date;               // Timestamp of creation (ISO 8601 string)
  deletedAt: Date | null;        // Soft delete timestamp (null = active)
}

/**
 * Zod validation schema for Wallet
 *
 * @see specs/001-personal-finance-tracker/data-model.md lines 534-541
 * @see specs/001-personal-finance-tracker/data-model.md lines 79-84
 */
export const WalletSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  createdAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable()
});

/**
 * Type helper for validating wallet input
 */
export type WalletInput = z.infer<typeof WalletSchema>;
