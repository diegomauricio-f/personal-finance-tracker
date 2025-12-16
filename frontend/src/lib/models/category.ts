import { z } from 'zod';

/**
 * Category entity representing a classification for transactions
 *
 * @see specs/001-personal-finance-tracker/data-model.md lines 120-128
 */
export interface Category {
  id: string;                    // UUID v4 for custom, fixed ID for predefined
  name: string;                  // Category name
  type: 'predefined' | 'custom'; // Category type
  createdAt: Date;               // Timestamp of creation (ISO 8601 string)
  deletedAt: Date | null;        // Soft delete timestamp (null = active, only for custom)
}

/**
 * Predefined categories that are always available
 *
 * @see specs/001-personal-finance-tracker/data-model.md lines 276-331
 */
export const PREDEFINED_CATEGORIES: Category[] = [
  {
    id: 'cat-food',
    name: 'Food',
    type: 'predefined',
    createdAt: new Date('2025-01-01'),
    deletedAt: null
  },
  {
    id: 'cat-transport',
    name: 'Transport',
    type: 'predefined',
    createdAt: new Date('2025-01-01'),
    deletedAt: null
  },
  {
    id: 'cat-salary',
    name: 'Salary',
    type: 'predefined',
    createdAt: new Date('2025-01-01'),
    deletedAt: null
  },
  {
    id: 'cat-entertainment',
    name: 'Entertainment',
    type: 'predefined',
    createdAt: new Date('2025-01-01'),
    deletedAt: null
  },
  {
    id: 'cat-utilities',
    name: 'Utilities',
    type: 'predefined',
    createdAt: new Date('2025-01-01'),
    deletedAt: null
  },
  {
    id: 'cat-healthcare',
    name: 'Healthcare',
    type: 'predefined',
    createdAt: new Date('2025-01-01'),
    deletedAt: null
  },
  {
    id: 'cat-other',
    name: 'Other',
    type: 'predefined',
    createdAt: new Date('2025-01-01'),
    deletedAt: null
  }
];

/**
 * Zod validation schema for Category
 *
 * @see specs/001-personal-finance-tracker/data-model.md lines 543-552
 * @see specs/001-personal-finance-tracker/data-model.md lines 131-136
 */
export const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  type: z.enum(['predefined', 'custom']),
  createdAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable()
});

/**
 * Type helper for validating category input
 */
export type CategoryInput = z.infer<typeof CategorySchema>;
