import { z } from "zod";
import { LIMITS } from "@/lib/constants";
import { isUsStateCode } from "@/lib/location/us-states";
import { CLAIM_VERIFICATION_METHODS, CLAIMANT_ROLES } from "@/types/business-claim";
import { createBusinessSchema } from "./business";

export const completeBusinessOnboardingSchema = z.object({
  name: createBusinessSchema.shape.name,
  categoryId: z.string().uuid("Please select a business category"),
  customCategory: z
    .string()
    .trim()
    .max(
      LIMITS.CUSTOM_CATEGORY_MAX_LENGTH,
      `Category must be ${LIMITS.CUSTOM_CATEGORY_MAX_LENGTH} characters or fewer`,
    )
    .nullable()
    .optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  websiteUrl: z
    .string()
    .trim()
    .url("Enter a valid website URL")
    .nullable()
    .optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  email: z.string().trim().email("Invalid email address").nullable().optional(),
  logoUrl: z.string().trim().url("Upload a logo image").nullable().optional(),
  addressLine1: z.string().trim().max(200).nullable().optional(),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(LIMITS.LOCATION_MAX_LENGTH),
  state: z
    .string()
    .trim()
    .toUpperCase()
    .refine(isUsStateCode, "Select a state abbreviation"),
  postalCode: z.string().trim().max(20).nullable().optional(),
  country: z.string().trim().min(2).max(2).optional().default("US"),
});

export const businessSearchQuerySchema = z.object({
  query: z.string().trim().min(2, "Enter at least 2 characters").max(100),
});

export const createClaimRequestSchema = z
  .object({
    businessId: z.string().uuid("Invalid business ID"),
    claimantName: z
      .string()
      .trim()
      .min(2, "Enter your full name")
      .max(120),
    claimantRole: z.enum(CLAIMANT_ROLES, {
      message: "Select your role at the business",
    }),
    contactPhone: z.string().trim().max(30).nullable().optional(),
    contactEmail: z
      .string()
      .trim()
      .email("Invalid email address")
      .nullable()
      .optional(),
    verificationMethod: z.enum(CLAIM_VERIFICATION_METHODS, {
      message: "Select a verification method",
    }),
    evidenceUrl: z
      .string()
      .trim()
      .url("Enter a valid link")
      .nullable()
      .optional(),
    note: z.string().trim().max(1000).nullable().optional(),
  })
  .refine((value) => Boolean(value.contactPhone || value.contactEmail), {
    message: "Add a phone number or email so we can reach you",
    path: ["contactPhone"],
  })
  .refine(
    (value) => value.verificationMethod !== "document" || Boolean(value.evidenceUrl),
    {
      message: "Add a link to your document",
      path: ["evidenceUrl"],
    },
  );

export const verifyClaimCodeSchema = z.object({
  claimId: z.string().uuid("Invalid claim ID"),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const claimIdSchema = z.object({
  claimId: z.string().uuid("Invalid claim ID"),
});

export type CompleteBusinessOnboardingSchema = z.infer<
  typeof completeBusinessOnboardingSchema
>;
