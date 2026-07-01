import { describe, expect, it } from "vitest";
import { createProfileSchema, profileSlugSchema } from "@/lib/validators/profile";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("profile validators", () => {
  describe("profileSlugSchema", () => {
    it("accepts valid slugs", () => {
      const result = profileSlugSchema.safeParse({ slug: "jane-doe" });
      expect(result.success).toBe(true);
    });

    it("rejects uppercase slugs", () => {
      const result = profileSlugSchema.safeParse({ slug: "Jane-Doe" });
      expect(result.success).toBe(false);
    });

    it("rejects leading hyphens", () => {
      const result = profileSlugSchema.safeParse({ slug: "-jane" });
      expect(result.success).toBe(false);
    });
  });

  describe("createProfileSchema", () => {
    it("accepts a complete profile", () => {
      const result = createProfileSchema.safeParse({
        slug: "jane-doe",
        fullName: "Jane Doe",
        professionId: VALID_UUID,
        bio: "Independent consultant",
        city: "Austin",
        state: "TX",
        profilePhoto: null,
      });

      expect(result.success).toBe(true);
    });

    it("requires profession UUID", () => {
      const result = createProfileSchema.safeParse({
        slug: "jane-doe",
        fullName: "Jane Doe",
        professionId: "not-a-uuid",
        city: "Austin",
        state: "TX",
      });

      expect(result.success).toBe(false);
    });
  });
});
