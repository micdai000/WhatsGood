import { describe, expect, it, vi } from "vitest";
import { noopReporter } from "@/lib/monitoring/noop-reporter";
import { reportError, setErrorReporter } from "@/lib/monitoring";

describe("error reporter", () => {
  it("delegates to the active reporter", () => {
    const captureException = vi.fn();
    setErrorReporter({
      captureException,
      captureMessage: vi.fn(),
    });

    reportError({ message: "Test failure", error: new Error("boom") });

    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Test failure" }),
    );

    setErrorReporter(noopReporter);
  });
});
