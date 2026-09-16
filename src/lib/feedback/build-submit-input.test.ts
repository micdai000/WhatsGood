import { describe, expect, it } from "vitest";
import { buildSubmitFeedbackInput } from "@/lib/feedback/build-submit-input";
import type { PublicBusinessQrCode } from "@/types";

const QR: PublicBusinessQrCode = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  businessId: "660e8400-e29b-41d4-a716-446655440000",
  locationId: "770e8400-e29b-41d4-a716-446655440000",
  code: "abc123",
  isActive: true,
};

describe("buildSubmitFeedbackInput", () => {
  it("attaches QR and location ids when a QR context is present", () => {
    const input = buildSubmitFeedbackInput({
      businessId: QR.businessId,
      qr: QR,
      wouldRecommend: true,
      experienceType: "Customer",
    });

    expect(input.qrCodeId).toBe(QR.id);
    expect(input.locationId).toBe(QR.locationId);
    expect(input.businessId).toBe(QR.businessId);
  });

  it("omits QR attribution when the visitor did not scan a code", () => {
    const input = buildSubmitFeedbackInput({
      businessId: QR.businessId,
      qr: null,
      wouldRecommend: false,
      experienceType: "Visitor",
    });

    expect(input.qrCodeId).toBeNull();
    expect(input.locationId).toBeNull();
  });
});
