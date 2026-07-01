import { z } from "zod";
import { PAGINATION } from "@/lib/constants";
import { sanitizeSlug } from "@/lib/utils/slug";

const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");

export const adminListParamsSchema = z.object({
  query: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .optional()
    .default(PAGINATION.DEFAULT_LIMIT),
});

export const adminCreateProfessionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  slug: z
    .string()
    .trim()
    .transform((value) => sanitizeSlug(value))
    .pipe(slugSchema),
  icon: z.string().trim().max(50).nullable().optional(),
});

export const adminUpdateProfessionSchema = adminCreateProfessionSchema
  .partial()
  .extend({
    isDisabled: z.boolean().optional(),
  });

export const adminProfessionIdSchema = z.object({
  id: z.string().uuid("Invalid profession ID"),
});

export const adminReviewIdSchema = z.object({
  id: z.string().uuid("Invalid review ID"),
});

export const adminProfileIdSchema = z.object({
  id: z.string().uuid("Invalid profile ID"),
});

export type AdminListParamsSchema = z.infer<typeof adminListParamsSchema>;
