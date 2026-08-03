import { describe, expect, it } from "vitest";
import {
  extractSocialUsername,
  getDisplayableSocialLinks,
  normalizeSocialUsernameInput,
  normalizeWebsiteInput,
  validateSocialUsernameInput,
  validateWebsiteInput,
} from "./social-links";

describe("normalizeSocialUsernameInput", () => {
  describe("instagram", () => {
    it.each([
      ["michael_davila", "https://instagram.com/michael_davila"],
      ["@michael_davila", "https://instagram.com/michael_davila"],
      [
        "https://instagram.com/michael_davila",
        "https://instagram.com/michael_davila",
      ],
      [
        "https://www.instagram.com/michael_davila/",
        "https://instagram.com/michael_davila",
      ],
    ])("normalizes %s", (input, expected) => {
      expect(normalizeSocialUsernameInput("instagram", input)).toBe(expected);
    });
  });

  describe("facebook", () => {
    it.each([
      ["michael.davila", "https://facebook.com/michael.davila"],
      ["facebook.com/michael.davila", "https://facebook.com/michael.davila"],
    ])("normalizes %s", (input, expected) => {
      expect(normalizeSocialUsernameInput("facebook", input)).toBe(expected);
    });
  });

  describe("x", () => {
    it.each([
      ["michael", "https://x.com/michael"],
      ["@michael", "https://x.com/michael"],
      ["https://x.com/michael", "https://x.com/michael"],
    ])("normalizes %s", (input, expected) => {
      expect(normalizeSocialUsernameInput("x", input)).toBe(expected);
    });
  });

  it("returns empty string for blank input", () => {
    expect(normalizeSocialUsernameInput("instagram", "   ")).toBe("");
  });
});

describe("normalizeWebsiteInput", () => {
  it("prepends https:// when missing", () => {
    expect(normalizeWebsiteInput("example.com")).toBe("https://example.com/");
  });

  it("keeps an explicit https URL", () => {
    expect(normalizeWebsiteInput("https://example.com/about")).toBe(
      "https://example.com/about",
    );
  });

  it("returns empty string for blank input", () => {
    expect(normalizeWebsiteInput("")).toBe("");
  });
});

describe("extractSocialUsername", () => {
  it("shows only the username for stored Instagram URLs", () => {
    expect(
      extractSocialUsername("instagram", "https://instagram.com/michael_davila"),
    ).toBe("michael_davila");
  });

  it("shows only the username for stored X URLs", () => {
    expect(extractSocialUsername("x", "https://x.com/michael")).toBe("michael");
  });
});

describe("validation", () => {
  it("allows empty values", () => {
    expect(validateSocialUsernameInput("instagram", "")).toBeNull();
    expect(validateWebsiteInput("")).toBeNull();
  });

  it("rejects invalid Instagram input", () => {
    expect(validateSocialUsernameInput("instagram", "not a handle!!")).toEqual(
      expect.stringContaining("Instagram"),
    );
  });

  it("rejects invalid website input", () => {
    expect(validateWebsiteInput("not a url")).toEqual(
      expect.stringContaining("website"),
    );
  });
});

describe("getDisplayableSocialLinks", () => {
  it("returns only platforms with valid http(s) URLs", () => {
    expect(
      getDisplayableSocialLinks({
        instagram: "https://instagram.com/michael_davila",
        facebook: "",
        x: "not-a-url",
        website: "https://example.com",
      }).map((link) => link.platform),
    ).toEqual(["instagram", "website"]);
  });

  it("returns an empty list when no links are set", () => {
    expect(
      getDisplayableSocialLinks({
        instagram: "",
        facebook: "",
        x: "",
        website: "",
      }),
    ).toEqual([]);
  });
});
