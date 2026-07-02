import { noopReporter } from "./noop-reporter";
import type { ErrorReport, ErrorReporter } from "./types";

let activeReporter: ErrorReporter = noopReporter;

/**
 * Register a production error reporter (e.g. Sentry adapter).
 * Call from `instrumentation.ts` when `ERROR_REPORTING_DSN` is set.
 */
export function setErrorReporter(reporter: ErrorReporter): void {
  activeReporter = reporter;
}

export function getErrorReporter(): ErrorReporter {
  return activeReporter;
}

export function reportError(report: ErrorReport): void {
  activeReporter.captureException(report);
}

export function reportMessage(
  message: string,
  context?: ErrorReport["context"],
): void {
  activeReporter.captureMessage(message, context);
}
