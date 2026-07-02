import type { ErrorReport, ErrorReporter } from "./types";

/** Default reporter — no-op in production until a vendor adapter is registered. */
export const noopReporter: ErrorReporter = {
  captureException(_report: ErrorReport): void {
    // Intentionally empty. Wire Sentry/Datadog via setErrorReporter() in instrumentation.
  },
  captureMessage(_message: string): void {
    // Intentionally empty.
  },
};
