/**
 * Custom error classes for the application
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 575-613
 */

/**
 * ValidationError - thrown when data fails validation
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * NotFoundError - thrown when an entity is not found
 */
export class NotFoundError extends Error {
  constructor(
    message: string,
    public entityType: string,
    public entityId: string
  ) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * ForbiddenError - thrown when an operation is not allowed
 */
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * StorageError - thrown when storage operations fail
 */
export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}
