import { z } from "zod";
import { LIMITS } from "@/lib/constants";

const locationTextSchema = z
  .string()
  .trim()
  .min(1, "This field is required")
  .max(LIMITS.LOCATION_MAX_LENGTH);

export const createBusinessLocationSchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
  name: z.string().trim().max(200).nullable().optional(),
  addressLine1: z.string().trim().max(200).nullable().optional(),
  addressLine2: z.string().trim().max(200).nullable().optional(),
  city: locationTextSchema,
  state: locationTextSchema,
  postalCode: z.string().trim().max(20).nullable().optional(),
  country: z.string().trim().min(2).max(2).optional().default("US"),
  phone: z.string().trim().max(30).nullable().optional(),
  isPrimary: z.boolean().optional().default(false),
});

export const updateBusinessLocationSchema = z.object({
  name: z.string().trim().max(200).nullable().optional(),
  addressLine1: z.string().trim().max(200).nullable().optional(),
  addressLine2: z.string().trim().max(200).nullable().optional(),
  city: locationTextSchema.optional(),
  state: locationTextSchema.optional(),
  postalCode: z.string().trim().max(20).nullable().optional(),
  country: z.string().trim().min(2).max(2).optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  isPrimary: z.boolean().optional(),
});

export const businessLocationIdSchema = z.object({
  id: z.string().uuid("Invalid location ID"),
});

export const businessLocationsByBusinessSchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
});

export type CreateBusinessLocationSchema = z.infer<
  typeof createBusinessLocationSchema
>;
export type UpdateBusinessLocationSchema = z.infer<
  typeof updateBusinessLocationSchema
>;
