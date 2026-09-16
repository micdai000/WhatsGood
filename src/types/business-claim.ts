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

export interface BusinessClaimRequest {
  id: string;
  businessId: string;
  userId: string;
  status: ClaimRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClaimRequestInput {
  businessId: string;
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
