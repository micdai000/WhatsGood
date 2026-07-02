import { BaseError } from "./base-error";

const DEFAULT_MESSAGE = "A database error occurred";

export class DatabaseError extends BaseError {
  readonly code = "DATABASE_ERROR";
  readonly statusCode = 500;

  constructor(message = DEFAULT_MESSAGE, details?: unknown) {
    super(message, details);
  }

  /** Maps upstream DB errors to a client-safe message while preserving details for logs. */
  static fromSource(
    source: { message: string },
    details?: unknown,
  ): DatabaseError {
    return new DatabaseError(DEFAULT_MESSAGE, {
      sourceMessage: source.message,
      ...(details && typeof details === "object" ? details : {}),
    });
  }
}
