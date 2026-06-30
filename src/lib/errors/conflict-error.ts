import { BaseError } from "./base-error";

export class ConflictError extends BaseError {
  readonly code = "CONFLICT";
  readonly statusCode = 409;

  constructor(message: string, details?: unknown) {
    super(message, details);
  }
}
