import type { PublicBusinessQrCode } from "@/types";

export type PublicQrResolveStatus =
  | "ok"
  | "not_found"
  | "inactive"
  | "unavailable";

export type ResolvedPublicQr =
  | { status: "not_found" }
  | { status: "inactive" }
  | { status: "unavailable" }
  | { status: "ok"; slug: string; qr: PublicBusinessQrCode };

export function mapResolvedPublicQr(payload: {
  status?: string;
  slug?: string | null;
  qr?: {
    id: string;
    business_id: string;
    location_id: string | null;
    code: string;
    is_active: boolean;
  } | null;
}): ResolvedPublicQr {
  if (payload.status === "inactive") {
    return { status: "inactive" };
  }
  if (payload.status === "unavailable") {
    return { status: "unavailable" };
  }
  if (payload.status === "ok" && payload.qr && payload.slug) {
    return {
      status: "ok",
      slug: payload.slug,
      qr: {
        id: payload.qr.id,
        businessId: payload.qr.business_id,
        locationId: payload.qr.location_id,
        code: payload.qr.code,
        isActive: payload.qr.is_active,
      },
    };
  }
  return { status: "not_found" };
}
