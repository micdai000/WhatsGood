import { BaseError } from "./base-error";

export class AuthorizationError extends BaseError {
  readonly code = "AUTHORIZATION_ERROR";
  readonly statusCode = 403;

  constructor(message = "You are not authorized to perform this action", details?: unknown) {
    super(message, details);
  }
}
