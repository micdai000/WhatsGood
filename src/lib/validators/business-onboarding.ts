import { z } from "zod";
import { LIMITS } from "@/lib/constants";
import { createBusinessSchema } from "./business";

export const completeBusinessOnboardingSchema = z.object({
  name: createBusinessSchema.shape.name,
  categoryId: z.string().uuid("Please select a business category"),
  description: z.string().trim().max(2000).nullable().optional(),
  websiteUrl: z
    .string()
    .trim()
    .url("Enter a valid website URL")
    .nullable()
    .optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  email: z.string().trim().email("Invalid email address").nullable().optional(),
  logoUrl: z.string().trim().url("Enter a valid logo URL").nullable().optional(),
  addressLine1: z.string().trim().max(200).nullable().optional(),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(LIMITS.LOCATION_MAX_LENGTH),
  state: z
    .string()
    .trim()
    .min(1, "State is required")
    .max(LIMITS.LOCATION_MAX_LENGTH),
  postalCode: z.string().trim().max(20).nullable().optional(),
  country: z.string().trim().min(2).max(2).optional().default("US"),
});

export const businessSearchQuerySchema = z.object({
  query: z.string().trim().min(2, "Enter at least 2 characters").max(100),
});

export const createClaimRequestSchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
});

export type CompleteBusinessOnboardingSchema = z.infer<
  typeof completeBusinessOnboardingSchema
>;
