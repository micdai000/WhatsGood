import { describe, expect, it } from "vitest";
import { isQrPrintRoute } from "@/lib/qr/print-route";

describe("isQrPrintRoute", () => {
  it("matches printable QR pages only", () => {
    expect(isQrPrintRoute("/dashboard/qr/print/abc")).toBe(true);
    expect(isQrPrintRoute("/dashboard/qr")).toBe(false);
    expect(isQrPrintRoute("/q/abc")).toBe(false);
  });
});
