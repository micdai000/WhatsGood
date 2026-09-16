import type { BusinessLocation } from "@/types";

export type BusinessLocationRow = {
  id: string;
  business_id: string;
  name: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  country: string;
  phone: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export function mapBusinessLocationRow(
  row: BusinessLocationRow,
): BusinessLocation {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    phone: row.phone,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
