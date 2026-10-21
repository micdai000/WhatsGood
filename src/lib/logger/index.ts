import { reportError } from "@/lib/monitoring";

const isDevelopment = process.env.NODE_ENV === "development";

type LogMeta = Record<string, unknown>;

const SENSITIVE_KEY_PATTERN =
  /password|token|secret|authorization|cookie|session|api[_-]?key|access[_-]?token|refresh[_-]?token|email/i;

function formatMeta(meta?: LogMeta): string {
  if (!meta || Object.keys(meta).length === 0) return "";
  return ` ${JSON.stringify(meta)}`;
}

function describeError(error: unknown): string | undefined {
  if (error == null) return undefined;
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    const message = typeof record.message === "string" ? record.message : "";
    const extra = [record.code, record.details, record.hint]
      .filter((part) => typeof part === "string" && part.length > 0)
      .join(" · ");
    if (message && extra) return `${message} (${extra})`;
    if (message) return message;
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return String(error);
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
    const errorMessage = describeError(error);

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
