import { z } from "zod";

export const reputationQuerySchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
});

export const reputationHistorySchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
  limit: z.number().int().min(1).max(24).optional(),
});

export const reputationLocationSchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
  locationId: z.string().uuid("Invalid location ID"),
});
