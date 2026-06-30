import { BaseError } from "./base-error";

export class ValidationError extends BaseError {
  readonly code = "VALIDATION_ERROR";
  readonly statusCode = 400;

  constructor(message: string, details?: unknown) {
    super(message, details);
  }
}
