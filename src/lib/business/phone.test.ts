import { describe, expect, it } from "vitest";
import { toTelHref } from "./phone";

describe("toTelHref", () => {
  it("returns null for empty or too-short values", () => {
    expect(toTelHref(null)).toBeNull();
    expect(toTelHref("")).toBeNull();
    expect(toTelHref("123")).toBeNull();
  });

  it("keeps an explicit country code", () => {
    expect(toTelHref("+1 (951) 287-4153")).toBe("tel:+19512874153");
  });

  it("treats 11-digit US numbers that start with 1 as E.164", () => {
    expect(toTelHref("19512874153")).toBe("tel:+19512874153");
  });

  it("treats 10-digit US numbers as E.164", () => {
    expect(toTelHref("951-287-4153")).toBe("tel:+19512874153");
  });
});
