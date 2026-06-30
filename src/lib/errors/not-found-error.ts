import { BaseError } from "./base-error";

export class NotFoundError extends BaseError {
  readonly code = "NOT_FOUND";
  readonly statusCode = 404;

  constructor(resource: string, details?: unknown) {
    super(`${resource} not found`, details);
  }
}
