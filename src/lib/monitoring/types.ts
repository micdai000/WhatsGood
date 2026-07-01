export type ErrorSeverity = "fatal" | "error" | "warning" | "info";

export type ErrorReportContext = {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: { id?: string; email?: string };
  fingerprint?: string[];
};

export type ErrorReport = {
  message: string;
  error?: unknown;
  severity?: ErrorSeverity;
  context?: ErrorReportContext;
};

export interface ErrorReporter {
  captureException(report: ErrorReport): void;
  captureMessage(message: string, context?: ErrorReportContext): void;
}
