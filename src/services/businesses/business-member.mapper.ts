import type { BusinessMember } from "@/types";
import {
  BUSINESS_MEMBER_ROLES,
  type BusinessMemberRole,
} from "@/types/business-member";

export type BusinessMemberRow = {
  id: string;
  business_id: string;
  user_id: string;
  role: string;
  created_at: string;
};

function asMemberRole(value: string): BusinessMemberRole {
  return (BUSINESS_MEMBER_ROLES as readonly string[]).includes(value)
    ? (value as BusinessMemberRole)
    : "member";
}

export function mapBusinessMemberRow(row: BusinessMemberRow): BusinessMember {
  return {
    id: row.id,
    businessId: row.business_id,
    userId: row.user_id,
    role: asMemberRole(row.role),
    createdAt: row.created_at,
  };
}
