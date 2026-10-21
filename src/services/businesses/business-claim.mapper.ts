import type { BusinessClaimRequest, ClaimRequestStatus } from "@/types";
import {
  CLAIM_REQUEST_STATUSES,
  CLAIM_VERIFICATION_METHODS,
  CLAIMANT_ROLES,
  type ClaimantRole,
  type ClaimVerificationMethod,
} from "@/types/business-claim";

export type ClaimRequestRow = {
  id: string;
  business_id: string;
  user_id: string;
  status: string;
  claimant_name?: string | null;
  claimant_role?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  verification_method?: string | null;
  evidence_url?: string | null;
  claimant_note?: string | null;
  code_issued_at?: string | null;
  code_expires_at?: string | null;
  review_notes?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
};

function asClaimStatus(value: string): ClaimRequestStatus {
  return (CLAIM_REQUEST_STATUSES as readonly string[]).includes(value)
    ? (value as ClaimRequestStatus)
    : "pending";
}

function asVerificationMethod(
  value: string | null | undefined,
): ClaimVerificationMethod {
  return (CLAIM_VERIFICATION_METHODS as readonly string[]).includes(value ?? "")
    ? (value as ClaimVerificationMethod)
    : "phone";
}

function asClaimantRole(value: string | null | undefined): ClaimantRole | null {
  return (CLAIMANT_ROLES as readonly string[]).includes(value ?? "")
    ? (value as ClaimantRole)
    : null;
}

export function mapClaimRequestRow(row: ClaimRequestRow): BusinessClaimRequest {
  return {
    id: row.id,
    businessId: row.business_id,
    userId: row.user_id,
    status: asClaimStatus(row.status),
    claimantName: row.claimant_name ?? null,
    claimantRole: asClaimantRole(row.claimant_role),
    contactPhone: row.contact_phone ?? null,
    contactEmail: row.contact_email ?? null,
    verificationMethod: asVerificationMethod(row.verification_method),
    evidenceUrl: row.evidence_url ?? null,
    claimantNote: row.claimant_note ?? null,
    codeIssuedAt: row.code_issued_at ?? null,
    codeExpiresAt: row.code_expires_at ?? null,
    reviewNotes: row.review_notes ?? null,
    reviewedAt: row.reviewed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
