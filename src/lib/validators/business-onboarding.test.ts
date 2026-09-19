import { describe, expect, it } from "vitest";
import {
  completeBusinessOnboardingSchema,
  createClaimRequestSchema,
} from "@/lib/validators/business-onboarding";
import { createBusinessSchema } from "@/lib/validators/business";
import { slugFromBusinessName, uniquifyBusinessSlug } from "@/lib/business/slug";
import { canCreateClaimRequest } from "@/lib/business/claim";
import { getQrPath } from "@/lib/qr/destination";
import { addBusinessMemberSchema } from "@/lib/validators/business-member";
import { generateSecureCode } from "@/lib/qr/generate-code";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("business onboarding validators", () => {
  it("requires name and category", () => {
    const result = completeBusinessOnboardingSchema.safeParse({
      city: "Austin",
      state: "TX",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a one-character business name", () => {
    const result = createBusinessSchema.safeParse({
      name: "A",
      slug: "a",
      categoryId: VALID_UUID,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a complete onboarding payload", () => {
    const result = completeBusinessOnboardingSchema.safeParse({
      name: "Joe's Auto",
      categoryId: VALID_UUID,
      city: "Austin",
      state: "TX",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe("US");
      expect("role" in result.data).toBe(false);
    }
  });

  it("accepts a custom category label", () => {
    const result = completeBusinessOnboardingSchema.safeParse({
      name: "Willow Pets",
      categoryId: VALID_UUID,
      customCategory: "Pet sitting",
      city: "Austin",
      state: "TX",
    });
    expect(result.success).toBe(true);
  });
});

describe("claim requests", () => {
  it("requires a business id", () => {
    expect(createClaimRequestSchema.safeParse({}).success).toBe(false);
    expect(
      createClaimRequestSchema.safeParse({ businessId: VALID_UUID }).success,
    ).toBe(true);
  });

  it("does not allow automatic claims of already claimed businesses", () => {
    expect(canCreateClaimRequest(true)).toBe(false);
    expect(canCreateClaimRequest(false)).toBe(true);
  });
});

describe("business slug and QR destination", () => {
  it("builds a slug from the business name", () => {
    expect(slugFromBusinessName("Joe's Auto")).toBe("joes-auto");
  });

  it("keeps the first slug attempt unchanged and uniquifies later ones", () => {
    expect(uniquifyBusinessSlug("joes-auto", 0)).toBe("joes-auto");
    const next = uniquifyBusinessSlug("joes-auto", 1);
    expect(next.startsWith("joes-auto-")).toBe(true);
    expect(next).not.toBe("joes-auto");
  });

  it("builds the QR route from the stored code", () => {
    const code = generateSecureCode();
    expect(getQrPath(code)).toBe(`/q/${code}`);
    expect(getQrPath(code)).not.toBe("/q/joes-auto");
  });
});

describe("membership authorization helpers", () => {
  it("does not default added members to owner", () => {
    const parsed = addBusinessMemberSchema.parse({
      businessId: VALID_UUID,
      userId: "660e8400-e29b-41d4-a716-446655440000",
    });
    expect(parsed.role).toBe("member");
  });
});
