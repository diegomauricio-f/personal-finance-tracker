/**
 * Category Store - Manage category CRUD operations
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 330-467
 */

import { writable, derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import type { Category } from '$lib/models/category';
import { CategorySchema, PREDEFINED_CATEGORIES } from '$lib/models/category';
import { ValidationError, NotFoundError, ForbiddenError } from '$lib/models/errors';
import { generateUUID } from '$lib/utils/uuid';
import { storageService } from '$lib/services/storage';
import { get } from 'svelte/store';

/**
 * Input types for category operations
 */
export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name?: string;
}

/**
 * Internal writable stores
 */
const customCategoriesStore = writable<Category[]>([]);
const isLoadingStore = writable<boolean>(false);
const errorStore = writable<string | null>(null);

/**
 * Initialize categories from storage
 */
function initializeCategories(): void {
  try {
    const storedCategories = storageService.getCategories();
    customCategoriesStore.set(storedCategories);
  } catch (error) {
    errorStore.set(`Failed to load categories: ${(error as Error).message}`);
  }
}

/**
 * Persist custom categories to storage
 */
function persistCategories(categories: Category[]): void {
  try {
    storageService.saveCategories(categories);
  } catch (error) {
    errorStore.set(`Failed to save categories: ${(error as Error).message}`);
    throw error;
  }
}

/**
 * Get all active categories (predefined + custom)
 */
function getAllActiveCategories(): Category[] {
  const customCategories = get(customCategoriesStore);
  const activeCustom = customCategories.filter(c => c.deletedAt === null);
  return [...PREDEFINED_CATEGORIES, ...activeCustom];
}

/**
 * Validate unique category name among active categories
 */
function validateUniqueName(name: string, excludeId?: string): void {
  const allCategories = getAllActiveCategories();
  const isDuplicate = allCategories.some(
    c => c.name === name && c.id !== excludeId
  );

  if (isDuplicate) {
    throw new ValidationError(`Category name "${name}" already exists`, 'name');
  }
}

/**
 * Validate category name format
 */
function validateCategoryName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new ValidationError('Category name is required', 'name');
  }
  if (name.length > 50) {
    throw new ValidationError('Category name must be 50 characters or less', 'name');
  }
}

/**
 * Create category object
 */
function createCategoryObject(name: string): Category {
  return {
    id: generateUUID(),
    name: name.trim(),
    type: 'custom',
    createdAt: new Date(),
    deletedAt: null
  };
}

/**
 * Create a custom category
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 370-388
 */
async function create(data: CreateCategoryInput): Promise<Category> {
  isLoadingStore.set(true);
  errorStore.set(null);

  try {
    validateCategoryName(data.name);
    validateUniqueName(data.name);

    const newCategory = createCategoryObject(data.name);
    CategorySchema.parse(newCategory);

    const categories = get(customCategoriesStore);
    const updatedCategories = [...categories, newCategory];
    customCategoriesStore.set(updatedCategories);
    persistCategories(updatedCategories);

    return newCategory;
  } catch (error) {
    errorStore.set((error as Error).message);
    throw error;
  } finally {
    isLoadingStore.set(false);
  }
}

/**
 * Validate and get updated category name
 */
function validateAndGetCategoryName(
  currentName: string,
  newName: string | undefined,
  id: string
): string {
  if (newName === undefined) return currentName;

  validateCategoryName(newName);
  validateUniqueName(newName, id);
  return newName.trim();
}

/**
 * Update custom category name
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 391-406
 */
async function update(id: string, data: UpdateCategoryInput): Promise<Category> {
  isLoadingStore.set(true);
  errorStore.set(null);

  try {
    const categories = get(customCategoriesStore);
    const categoryIndex = categories.findIndex(c => c.id === id && c.deletedAt === null);

    if (categoryIndex === -1) {
      throw new NotFoundError('Category not found', 'Category', id);
    }

    const category = categories[categoryIndex];

    if (category.type === 'predefined') {
      throw new ForbiddenError('Cannot update predefined categories');
    }

    const updatedName = validateAndGetCategoryName(category.name, data.name, id);
    const updatedCategory: Category = { ...category, name: updatedName };

    const updatedCategories = [...categories];
    updatedCategories[categoryIndex] = updatedCategory;
    customCategoriesStore.set(updatedCategories);
    persistCategories(updatedCategories);

    return updatedCategory;
  } catch (error) {
    errorStore.set((error as Error).message);
    throw error;
  } finally {
    isLoadingStore.set(false);
  }
}

/**
 * Soft delete a custom category
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 409-431
 */
async function softDelete(id: string): Promise<void> {
  isLoadingStore.set(true);
  errorStore.set(null);

  try {
    const categories = get(customCategoriesStore);
    const categoryIndex = categories.findIndex(c => c.id === id && c.deletedAt === null);

    if (categoryIndex === -1) {
      throw new NotFoundError('Category not found', 'Category', id);
    }

    const category = categories[categoryIndex];

    // Check if it's predefined
    if (category.type === 'predefined') {
      throw new ForbiddenError('Cannot delete predefined categories');
    }

    // Soft delete category
    const updatedCategory: Category = {
      ...category,
      deletedAt: new Date()
    };

    const updatedCategories = [...categories];
    updatedCategories[categoryIndex] = updatedCategory;
    customCategoriesStore.set(updatedCategories);
    persistCategories(updatedCategories);
  } catch (error) {
    errorStore.set((error as Error).message);
    throw error;
  } finally {
    isLoadingStore.set(false);
  }
}

/**
 * Get category by ID (includes soft-deleted and predefined)
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 434-439
 */
function getById(id: string): Category | undefined {
  // Check predefined first
  const predefined = PREDEFINED_CATEGORIES.find(c => c.id === id);
  if (predefined) {
    return predefined;
  }

  // Check custom categories
  const categories = get(customCategoriesStore);
  return categories.find(c => c.id === id);
}

/**
 * Check if category is predefined
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 442-447
 */
function isPredefined(id: string): boolean {
  const category = getById(id);
  return category?.type === 'predefined';
}

/**
 * Derived store: Active categories (predefined + active custom)
 */
const categories = derived(customCategoriesStore, $customCategories => {
  const activeCustom = $customCategories.filter(c => c.deletedAt === null);
  return [...PREDEFINED_CATEGORIES, ...activeCustom];
});

/**
 * Derived store: Active custom categories only
 */
const customCategories = derived(customCategoriesStore, $customCategories =>
  $customCategories.filter(c => c.deletedAt === null)
);

/**
 * Derived store: All categories (includes soft-deleted custom)
 */
const allCategories = derived(customCategoriesStore, $customCategories => {
  return [...PREDEFINED_CATEGORIES, ...$customCategories];
});

/**
 * Initialize store on module load
 */
initializeCategories();

/**
 * Category Store Interface
 */
export interface CategoryStore {
  categories: Readable<Category[]>;
  customCategories: Readable<Category[]>;
  allCategories: Readable<Category[]>;
  isLoading: Readable<boolean>;
  error: Readable<string | null>;
  create: (data: CreateCategoryInput) => Promise<Category>;
  update: (id: string, data: UpdateCategoryInput) => Promise<Category>;
  softDelete: (id: string) => Promise<void>;
  getById: (id: string) => Category | undefined;
  isPredefined: (id: string) => boolean;
}

/**
 * Exported Category Store
 */
export const categoryStore: CategoryStore = {
  categories,
  customCategories,
  allCategories,
  isLoading: isLoadingStore,
  error: errorStore,
  create,
  update,
  softDelete,
  getById,
  isPredefined
};
