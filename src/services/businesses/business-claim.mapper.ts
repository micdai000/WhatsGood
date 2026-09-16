import type { BusinessClaimRequest, ClaimRequestStatus } from "@/types";
import { CLAIM_REQUEST_STATUSES } from "@/types/business-claim";

export type ClaimRequestRow = {
  id: string;
  business_id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function asClaimStatus(value: string): ClaimRequestStatus {
  return (CLAIM_REQUEST_STATUSES as readonly string[]).includes(value)
    ? (value as ClaimRequestStatus)
    : "pending";
}

export function mapClaimRequestRow(row: ClaimRequestRow): BusinessClaimRequest {
  return {
    id: row.id,
    businessId: row.business_id,
    userId: row.user_id,
    status: asClaimStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
