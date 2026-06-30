import { BaseError } from "./base-error";

export class ApplicationError extends BaseError {
  readonly code: string;
  readonly statusCode: number;

  constructor(
    message: string,
    code = "APPLICATION_ERROR",
    statusCode = 500,
    details?: unknown,
  ) {
    super(message, details);
    this.code = code;
    this.statusCode = statusCode;
  }
}
