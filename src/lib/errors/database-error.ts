import { BaseError } from "./base-error";

export class DatabaseError extends BaseError {
  readonly code = "DATABASE_ERROR";
  readonly statusCode = 500;

  constructor(message = "A database error occurred", details?: unknown) {
    super(message, details);
  }
}
