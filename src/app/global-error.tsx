"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            TrustLoop is temporarily unavailable
          </h1>
          <p className="mt-3 text-muted-foreground">
            A critical error occurred. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
