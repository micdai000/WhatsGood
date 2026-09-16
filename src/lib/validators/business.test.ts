import { describe, expect, it } from "vitest";
import {
  createBusinessSchema,
  updateBusinessSchema,
} from "@/lib/validators/business";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("business validators", () => {
  describe("createBusinessSchema", () => {
    it("accepts valid business input and sanitizes the slug", () => {
      const result = createBusinessSchema.safeParse({
        name: "Joe's Auto",
        slug: "Joes-Auto",
        categoryId: VALID_UUID,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBe("joes-auto");
        expect(result.data.name).toBe("Joe's Auto");
      }
    });

    it("rejects a missing name", () => {
      const result = createBusinessSchema.safeParse({
        slug: "joes-auto",
      });

      expect(result.success).toBe(false);
    });

    it("rejects an invalid email", () => {
      const result = createBusinessSchema.safeParse({
        name: "Joe's Auto",
        slug: "joes-auto",
        email: "not-an-email",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updateBusinessSchema", () => {
    it("accepts a partial update", () => {
      const result = updateBusinessSchema.safeParse({
        status: "archived",
      });

      expect(result.success).toBe(true);
    });

    it("rejects an invalid status", () => {
      const result = updateBusinessSchema.safeParse({
        status: "inactive",
      });

      expect(result.success).toBe(false);
    });
  });
});
