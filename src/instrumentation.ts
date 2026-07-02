export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;

  const { validatePublicEnv } = await import("@/lib/env");

  if (process.env.NODE_ENV === "production") {
    validatePublicEnv();
  }

  // Example Sentry integration point:
  // if (process.env.ERROR_REPORTING_DSN) {
  //   const Sentry = await import("@sentry/nextjs");
  //   Sentry.init({ dsn: process.env.ERROR_REPORTING_DSN, tracesSampleRate: 0.1 });
  //   const { setErrorReporter } = await import("@/lib/monitoring");
  //   setErrorReporter({
  //     captureException: (report) => Sentry.captureException(report.error ?? report.message, {
  //       extra: report.context?.extra,
  //       tags: report.context?.tags,
  //     }),
  //     captureMessage: (message, context) => Sentry.captureMessage(message, {
  //       extra: context?.extra,
  //       tags: context?.tags,
  //     }),
  //   });
  // }
}
