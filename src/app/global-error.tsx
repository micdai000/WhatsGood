"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/monitoring";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError({
      message: error.message,
      error,
      severity: "fatal",
      context: { tags: { boundary: "global-error", digest: error.digest ?? "unknown" } },
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <main
          style={{
            maxWidth: "32rem",
            margin: "0 auto",
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
            TrustLoop is temporarily unavailable
          </h1>
          <p style={{ marginTop: "0.75rem", color: "#6b7280" }}>
            A critical error occurred. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "2rem",
              borderRadius: "0.375rem",
              backgroundColor: "#111827",
              color: "#ffffff",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
