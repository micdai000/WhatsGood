import { describe, expect, it } from "vitest";
import { mapResolvedPublicQr } from "@/lib/qr/resolve-public-qr";

describe("mapResolvedPublicQr", () => {
  it("maps a valid QR to the business slug and ids", () => {
    const result = mapResolvedPublicQr({
      status: "ok",
      slug: "riverside-auto-care",
      qr: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        business_id: "660e8400-e29b-41d4-a716-446655440000",
        location_id: "770e8400-e29b-41d4-a716-446655440000",
        code: "abc123",
        is_active: true,
      },
    });

    expect(result).toEqual({
      status: "ok",
      slug: "riverside-auto-care",
      qr: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        businessId: "660e8400-e29b-41d4-a716-446655440000",
        locationId: "770e8400-e29b-41d4-a716-446655440000",
        code: "abc123",
        isActive: true,
      },
    });
  });

  it("distinguishes inactive, unavailable, and missing codes", () => {
    expect(mapResolvedPublicQr({ status: "inactive" }).status).toBe("inactive");
    expect(mapResolvedPublicQr({ status: "unavailable" }).status).toBe(
      "unavailable",
    );
    expect(mapResolvedPublicQr({ status: "not_found" }).status).toBe(
      "not_found",
    );
    expect(mapResolvedPublicQr({}).status).toBe("not_found");
  });
});
