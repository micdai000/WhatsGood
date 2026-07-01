import { ApplicationError, BaseError } from "@/lib/errors";
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

export { success, failure };
