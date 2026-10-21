import type { Business } from "./business";
import type { BusinessLocation } from "./business-location";
import type { BusinessQrCode } from "./business-qr";

export const CLAIM_REQUEST_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
] as const;

export type ClaimRequestStatus = (typeof CLAIM_REQUEST_STATUSES)[number];

export const CLAIM_VERIFICATION_METHODS = [
  "phone",
  "email",
  "website",
  "document",
] as const;

export type ClaimVerificationMethod =
  (typeof CLAIM_VERIFICATION_METHODS)[number];

export const CLAIMANT_ROLES = ["owner", "co_owner", "manager"] as const;

export type ClaimantRole = (typeof CLAIMANT_ROLES)[number];

export interface BusinessClaimRequest {
  id: string;
  businessId: string;
  userId: string;
  status: ClaimRequestStatus;
  claimantName: string | null;
  claimantRole: ClaimantRole | null;
  contactPhone: string | null;
  contactEmail: string | null;
  verificationMethod: ClaimVerificationMethod;
  evidenceUrl: string | null;
  claimantNote: string | null;
  codeIssuedAt: string | null;
  codeExpiresAt: string | null;
  reviewNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClaimRequestInput {
  businessId: string;
  claimantName: string;
  claimantRole: ClaimantRole;
  contactPhone?: string | null;
  contactEmail?: string | null;
  verificationMethod: ClaimVerificationMethod;
  evidenceUrl?: string | null;
  note?: string | null;
}

export interface ClaimRequestWithBusiness extends BusinessClaimRequest {
  businessName: string;
  businessSlug: string;
}

export type VerifyClaimCodeResult =
  | { ok: true; claim: BusinessClaimRequest }
  | { ok: false; error: string; attemptsRemaining?: number };

export interface AdminBusinessClaim {
  claim: BusinessClaimRequest;
  claimantEmail: string | null;
  business: Business;
  city: string | null;
  state: string | null;
  codeAttempts: number | null;
}

export interface BusinessSearchResult {
  id: string;
  name: string;
  slug: string;
  isClaimed: boolean;
  categoryName: string | null;
  city: string | null;
  state: string | null;
}

export interface CompleteBusinessOnboardingInput {
  name: string;
  categoryId: string;
  description?: string | null;
  websiteUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  addressLine1?: string | null;
  city: string;
  state: string;
  postalCode?: string | null;
  country?: string;
}

export interface CompleteBusinessOnboardingResult {
  business: Business;
  location: BusinessLocation;
  qrCode: BusinessQrCode;
}
