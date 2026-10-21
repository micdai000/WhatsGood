import type { ClaimantRole, ClaimVerificationMethod } from "@/types";

export function canCreateClaimRequest(isClaimed: boolean): boolean {
  return isClaimed !== true;
}

/** Token a claimant posts on their website or social bio for website verification. */
export function getClaimWebsiteToken(claimId: string): string {
  return `meritt-${claimId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export const CLAIMANT_ROLE_LABELS: Record<ClaimantRole, string> = {
  owner: "Owner",
  co_owner: "Co-owner",
  manager: "Manager",
};

export const VERIFICATION_METHOD_LABELS: Record<ClaimVerificationMethod, string> = {
  phone: "Phone call to the business",
  email: "Email to the business",
  website: "Code on website or social profile",
  document: "Business document",
};

export const VERIFICATION_METHOD_DESCRIPTIONS: Record<ClaimVerificationMethod, string> = {
  phone:
    "We call the phone number publicly listed for this business and give you a 6-digit code.",
  email:
    "We email a 6-digit code to the business email or an address at the business website's domain.",
  website:
    "You add a short code to your website or a social profile linked to the business, then we check it.",
  document:
    "Share a business license, utility bill, or tax letter showing the business name and address.",
};

export function usesVerificationCode(method: ClaimVerificationMethod): boolean {
  return method === "phone" || method === "email";
}
