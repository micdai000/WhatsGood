import { describe, expect, it } from "vitest";
import { generateSecureCode } from "@/lib/qr/generate-code";

describe("generateSecureCode", () => {
  it("returns a 32-character hex string", () => {
    const code = generateSecureCode();

    expect(code).toMatch(/^[0-9a-f]{32}$/);
  });

  it("produces unique values", () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateSecureCode()));

    expect(codes.size).toBe(50);
  });
});
