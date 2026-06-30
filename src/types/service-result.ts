import type { ApplicationError } from "@/lib/errors";

export type SuccessResult<T> = {
  success: true;
  data: T;
};

export type FailureResult = {
  success: false;
  error: ApplicationError;
};

export type ServiceResult<T> = SuccessResult<T> | FailureResult;

export function success<T>(data: T): SuccessResult<T> {
  return { success: true, data };
}

export function failure<T = never>(error: ApplicationError): ServiceResult<T> {
  return { success: false, error };
}

export function isSuccess<T>(
  result: ServiceResult<T>,
): result is SuccessResult<T> {
  return result.success === true;
}

export function isFailure<T>(
  result: ServiceResult<T>,
): result is FailureResult {
  return result.success === false;
}
