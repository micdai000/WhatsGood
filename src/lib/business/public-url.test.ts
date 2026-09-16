import { describe, expect, it } from "vitest";
import { getPublicBusinessPath } from "@/lib/business/public-url";
import { getQrPath } from "@/lib/qr/destination";

describe("public business URLs", () => {
  it("builds the canonical public business path from the slug", () => {
    expect(getPublicBusinessPath("riverside-auto-care")).toBe(
      "/b/riverside-auto-care",
    );
  });

  it("keeps QR destinations on the opaque code, not the slug", () => {
    expect(getQrPath("dcc611f272d7cfdcd742469d5d5da3e4")).toBe(
      "/q/dcc611f272d7cfdcd742469d5d5da3e4",
    );
    expect(getQrPath("abc123")).not.toBe("/b/abc123");
  });
});
