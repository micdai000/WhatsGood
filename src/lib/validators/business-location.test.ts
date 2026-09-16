import { describe, expect, it } from "vitest";
import { createBusinessLocationSchema } from "@/lib/validators/business-location";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("createBusinessLocationSchema", () => {
  it("accepts a location with required city and state", () => {
    const result = createBusinessLocationSchema.safeParse({
      businessId: VALID_UUID,
      city: "Austin",
      state: "TX",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe("US");
      expect(result.data.isPrimary).toBe(false);
    }
  });

  it("rejects a location without a city", () => {
    const result = createBusinessLocationSchema.safeParse({
      businessId: VALID_UUID,
      state: "TX",
    });

    expect(result.success).toBe(false);
  });
});
