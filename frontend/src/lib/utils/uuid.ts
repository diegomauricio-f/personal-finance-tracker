/**
 * UUID generation utility using crypto.randomUUID()
 *
 * @see specs/001-personal-finance-tracker/plan.md lines 178-182
 */

/**
 * Generates a UUID v4 using the Web Crypto API
 *
 * @returns A UUID v4 string
 * @throws {Error} If crypto.randomUUID is not available
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  throw new Error('crypto.randomUUID is not available in this environment');
}
