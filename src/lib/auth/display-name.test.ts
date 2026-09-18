import { describe, expect, it } from "vitest";
import { getAccountDisplayName, getInitials } from "@/lib/auth/display-name";

describe("getAccountDisplayName", () => {
  it("prefers the signup full name over the email username", () => {
    expect(
      getAccountDisplayName({
        fullName: "Silas Davila",
        email: "daimbd000@example.com",
      }),
    ).toBe("Silas Davila");
  });

  it("falls back to the email local part only when no full name exists", () => {
    expect(
      getAccountDisplayName({
        fullName: null,
        email: "daimbd000@example.com",
      }),
    ).toBe("daimbd000");
  });
});

describe("getInitials", () => {
  it("uses the first letters of the full name", () => {
    expect(getInitials("Silas Davila")).toBe("SD");
  });
});
