export const BUSINESS_MEMBER_ROLES = ["owner", "admin", "member"] as const;

export type BusinessMemberRole = (typeof BUSINESS_MEMBER_ROLES)[number];

export interface BusinessMember {
  id: string;
  businessId: string;
  userId: string;
  role: BusinessMemberRole;
  createdAt: string;
}

export interface AddBusinessMemberInput {
  businessId: string;
  userId: string;
  role?: BusinessMemberRole;
}
