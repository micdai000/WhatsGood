import { z } from "zod";
import { PAGINATION } from "@/lib/constants";

export const submitFeedbackSchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
  locationId: z.string().uuid("Invalid location ID").nullable().optional(),
  qrCodeId: z.string().uuid("Invalid QR code ID").nullable().optional(),
  wouldRecommend: z.boolean().nullable().optional(),
  experienceType: z.string().trim().max(100).nullable().optional(),
  feedbackData: z.record(z.string(), z.unknown()).optional().default({}),
});

export const feedbackQuerySchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
  page: z.number().int().min(1).optional(),
  limit: z
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .optional(),
});

export type SubmitFeedbackSchema = z.infer<typeof submitFeedbackSchema>;
