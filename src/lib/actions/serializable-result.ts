import { isFailure, type ServiceResult } from "@/types";

/**
 * Serializable result for Server Actions called from Client Components.
 * ServiceResult.failure carries BaseError class instances that cannot cross
 * the React Server → Client serialization boundary.
 */
export type SerializableActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; code: string };

export function toSerializableActionResult<T>(
  result: ServiceResult<T>,
): SerializableActionResult<T> {
  if (isFailure(result)) {
    return {
      success: false,
      message: result.error.message,
      code: result.error.code,
    };
  }

  return { success: true, data: result.data };
}
