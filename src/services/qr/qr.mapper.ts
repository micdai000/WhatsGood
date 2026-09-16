import type { BusinessQrCode, PublicBusinessQrCode } from "@/types";

export type QrCodeRow = {
  id: string;
  business_id: string;
  location_id: string | null;
  code: string;
  label?: string | null;
  is_active: boolean;
  scan_count?: number;
  created_at?: string;
  updated_at?: string;
};

export function mapQrCodeRow(row: QrCodeRow): BusinessQrCode {
  return {
    id: row.id,
    businessId: row.business_id,
    locationId: row.location_id,
    code: row.code,
    label: row.label ?? null,
    isActive: row.is_active,
    scanCount: row.scan_count ?? 0,
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

export function mapPublicQrCodeRow(row: QrCodeRow): PublicBusinessQrCode {
  return {
    id: row.id,
    businessId: row.business_id,
    locationId: row.location_id,
    code: row.code,
    isActive: row.is_active,
  };
}
