import { describe, expect, it } from "vitest";
import { generateQrPngDataUrl } from "@/lib/qr/generate-png";

describe("generateQrPngDataUrl", () => {
  it("creates a PNG data URL for a QR destination", async () => {
    const dataUrl = await generateQrPngDataUrl("https://www.themeritt.com/q/abc123", 240);

    expect(dataUrl.startsWith("data:image/png;base64,")).toBe(true);
    expect(dataUrl.length).toBeGreaterThan(100);
  });
});
