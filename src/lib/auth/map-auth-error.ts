import { AuthError } from "@supabase/supabase-js";
import {
  ApplicationError,
  AuthorizationError,
  ConflictError,
  DatabaseError,
  ValidationError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";

export function mapAuthError(error: AuthError): ApplicationError {
  const message = error.message.toLowerCase();

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid email or password")
  ) {
    return new ApplicationError(
      "Invalid email or password",
      "INVALID_CREDENTIALS",
      401,
    );
  }

  if (
    message.includes("user already registered") ||
    message.includes("already been registered")
  ) {
    return new ConflictError("An account with this email already exists");
  }

  if (message.includes("password") && message.includes("weak")) {
    return new ValidationError(
      "Password is too weak. Use at least 8 characters with mixed character types.",
    );
  }

  if (
    message.includes("email not confirmed") ||
    message.includes("email not verified")
  ) {
    return new AuthorizationError(
      "Please verify your email before signing in.",
    );
  }

  if (
    message.includes("otp expired") ||
    message.includes("token has expired") ||
    message.includes("expired")
  ) {
    return new ApplicationError(
      "This link has expired. Please request a new one.",
      "EXPIRED_TOKEN",
      400,
    );
  }

  if (message.includes("network") || message.includes("fetch")) {
    return new ApplicationError(
      "Network error. Please check your connection and try again.",
      "NETWORK_ERROR",
      503,
    );
  }

  if (error.status === 422 || error.status === 400) {
    logger.warn("mapAuthError: unmatched validation error", {
      status: error.status,
      code: error.code,
      originalMessage: error.message,
    });
    return new ValidationError(
      "The request could not be processed. Please check your input and try again.",
    );
  }

  if (error.status === 403) {
    logger.warn("mapAuthError: unmatched authorization error", {
      status: error.status,
      code: error.code,
      originalMessage: error.message,
    });
    return new AuthorizationError(
      "You do not have permission to perform this action.",
    );
  }

  return DatabaseError.fromSource(error, { code: error.code });
}

export function mapUnknownAuthError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }

  if (error instanceof AuthError) {
    return mapAuthError(error);
  }

  if (error instanceof Error) {
    return new ApplicationError(
      "An unexpected error occurred",
      "INTERNAL_ERROR",
      500,
    );
  }

  return new ApplicationError(
    "An unexpected error occurred",
    "INTERNAL_ERROR",
    500,
  );
}
