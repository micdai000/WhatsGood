import { reportError } from "@/lib/monitoring";

const isDevelopment = process.env.NODE_ENV === "development";

type LogMeta = Record<string, unknown>;

const SENSITIVE_KEY_PATTERN =
  /password|token|secret|authorization|cookie|session|api[_-]?key|access[_-]?token|refresh[_-]?token|email/i;

function formatMeta(meta?: LogMeta): string {
  if (!meta || Object.keys(meta).length === 0) return "";
  return isDevelopment ? ` ${JSON.stringify(meta)}` : "";
}

function sanitizeMeta(meta?: LogMeta): LogMeta | undefined {
  if (!meta) return meta;

  const sanitized: LogMeta = {};

  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      sanitized[key] = "[redacted]";
    } else if (typeof value === "string" && SENSITIVE_KEY_PATTERN.test(value)) {
      sanitized[key] = "[redacted]";
    } else {
      sanitized[key] = value;
    }
  }

  return isDevelopment ? meta : sanitized;
}

export const logger = {
  info(message: string, meta?: LogMeta): void {
    if (isDevelopment) {
      console.info(`[INFO] ${message}${formatMeta(meta)}`);
    }
  },

  warn(message: string, meta?: LogMeta): void {
    console.warn(`[WARN] ${message}${formatMeta(sanitizeMeta(meta))}`);
  },

  error(message: string, error?: unknown, meta?: LogMeta): void {
    const errorMessage =
      error instanceof Error ? error.message : error ? String(error) : undefined;

    console.error(
      `[ERROR] ${message}${errorMessage ? `: ${errorMessage}` : ""}${formatMeta(sanitizeMeta(meta))}`,
    );

    if (isDevelopment && error instanceof Error && error.stack) {
      console.error(error.stack);
    }

    reportError({
      message,
      error,
      severity: "error",
      context: { extra: sanitizeMeta(meta) },
    });
  },
};
