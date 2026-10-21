import {
  ApplicationError,
  AuthorizationError,
  BaseError,
  ConflictError,
  DatabaseError,
  ValidationError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";
import { failure, success, type ServiceResult } from "@/types";

export function notImplemented<T>(method: string): ServiceResult<T> {
  logger.warn(`${method} is not yet implemented`);
  return failure(
    new ApplicationError(
      `${method} is not yet implemented`,
      "NOT_IMPLEMENTED",
      501,
    ),
  );
}

export function handleServiceError<T>(
  method: string,
  error: unknown,
): ServiceResult<T> {
  if (error instanceof BaseError) {
    logger.error(method, error);
    return failure(error);
  }

  logger.error(method, error);
  return failure(
    new ApplicationError("An unexpected error occurred", "INTERNAL_ERROR", 500),
  );
}

/**
 * Maps errors raised by our SECURITY DEFINER RPCs. Their messages are written
 * for end users, so they are surfaced instead of the generic database message.
 */
export function mapRpcError<T>(
  error: { code?: string; message: string },
  fallbackConflictMessage = "This change conflicts with existing data",
): ServiceResult<T> {
  switch (error.code) {
    case "42501":
      return failure(new AuthorizationError(error.message));
    case "22023":
      return failure(new ValidationError(error.message));
    case "23505":
      return failure(
        new ConflictError(
          error.message.startsWith("duplicate key")
            ? fallbackConflictMessage
            : error.message,
        ),
      );
    default:
      return failure(DatabaseError.fromSource(error));
  }
}

export { success, failure };
