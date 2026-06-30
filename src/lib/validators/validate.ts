import { ZodError, type ZodSchema } from "zod";
import { ValidationError } from "@/lib/errors";

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError("Validation failed", formatZodError(result.error));
  }

  return result.data;
}

export function safeValidate<T>(
  schema: ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: ValidationError } {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: new ValidationError("Validation failed", formatZodError(result.error)),
    };
  }

  return { success: true, data: result.data };
}

function formatZodError(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_root";
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  }

  return fieldErrors;
}
