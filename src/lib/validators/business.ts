import { z } from "zod";
import { LIMITS } from "@/lib/constants";
import { sanitizeSlug } from "@/lib/utils/slug";
import { BUSINESS_STATUSES } from "@/types/business";

const businessSlugSchema = z
  .string()
  .trim()
  .transform((value) => sanitizeSlug(value))
  .pipe(
    z
      .string()
      .min(1, "Slug is required")
      .max(LIMITS.SLUG_MAX_LENGTH)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ),
  );

const optionalUrlSchema = z
  .string()
  .trim()
  .url("Invalid URL")
  .nullable()
  .optional();

const optionalEmailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .nullable()
  .optional();

const socialLinksSchema = z
  .object({
    instagram: z.string(),
    facebook: z.string(),
    x: z.string(),
    website: z.string(),
  })
  .passthrough();

export const businessIdSchema = z.object({
  id: z.string().uuid("Invalid business ID"),
});

export const businessSlugLookupSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(LIMITS.SLUG_MAX_LENGTH),
});

export const createBusinessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      LIMITS.BUSINESS_NAME_MIN_LENGTH,
      `Business name must be at least ${LIMITS.BUSINESS_NAME_MIN_LENGTH} characters`,
    )
    .max(
      LIMITS.BUSINESS_NAME_MAX_LENGTH,
      `Business name must be ${LIMITS.BUSINESS_NAME_MAX_LENGTH} characters or fewer`,
    ),
  slug: businessSlugSchema,
  description: z.string().trim().max(2000).nullable().optional(),
  logoUrl: optionalUrlSchema,
  websiteUrl: optionalUrlSchema,
  phone: z.string().trim().max(30).nullable().optional(),
  email: optionalEmailSchema,
  categoryId: z.string().uuid("Invalid category ID").nullable().optional(),
  socialLinks: socialLinksSchema.optional(),
});

export const updateBusinessSchema = createBusinessSchema
  .omit({ slug: true })
  .partial()
  .extend({
    status: z.enum(BUSINESS_STATUSES).optional(),
  });

export type CreateBusinessSchema = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessSchema = z.infer<typeof updateBusinessSchema>;
