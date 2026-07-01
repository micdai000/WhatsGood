import { z } from "zod";
import { LIMITS, PAGINATION } from "@/lib/constants";
import { PROFILE_SORT_ORDERS } from "@/types/search";

export const profileSearchSchema = z.object({
  query: z
    .string()
    .max(LIMITS.FULL_NAME_MAX_LENGTH)
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  professionId: z.string().uuid("Invalid profession").optional(),
  city: z
    .string()
    .max(LIMITS.LOCATION_MAX_LENGTH)
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  state: z
    .string()
    .max(LIMITS.LOCATION_MAX_LENGTH)
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  sort: z.enum(PROFILE_SORT_ORDERS).optional().default("newest"),
  page: z.coerce.number().int().min(1).optional().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .optional()
    .default(12),
  completeOnly: z.coerce.boolean().optional().default(true),
});

export type ProfileSearchSchema = z.infer<typeof profileSearchSchema>;
