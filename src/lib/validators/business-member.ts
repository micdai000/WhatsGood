import { z } from "zod";
import { BUSINESS_MEMBER_ROLES } from "@/types/business-member";

export const businessMemberRoleSchema = z.enum(BUSINESS_MEMBER_ROLES);

export const addBusinessMemberSchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
  userId: z.string().uuid("Invalid user ID"),
  role: businessMemberRoleSchema.optional().default("member"),
});

export const updateBusinessMemberRoleSchema = z.object({
  id: z.string().uuid("Invalid member ID"),
  role: businessMemberRoleSchema,
});

export const businessMemberIdSchema = z.object({
  id: z.string().uuid("Invalid member ID"),
});

export const businessMembersByBusinessSchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
});

export type AddBusinessMemberSchema = z.infer<typeof addBusinessMemberSchema>;
