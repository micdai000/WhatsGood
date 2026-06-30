import { z } from "zod";
import { LIMITS } from "@/lib/constants";

const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(LIMITS.SLUG_MAX_LENGTH)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain only lowercase letters, numbers, and hyphens",
  );

export const createProfileSchema = z.object({
  slug: slugSchema,
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(LIMITS.FULL_NAME_MAX_LENGTH),
  professionId: z.string().uuid().nullable().optional(),
  bio: z.string().max(LIMITS.BIO_MAX_LENGTH).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  state: z.string().max(100).nullable().optional(),
  profilePhoto: z.string().url().nullable().optional(),
});

export const updateProfileSchema = createProfileSchema.partial();

export const profileIdSchema = z.object({
  id: z.string().uuid("Invalid profile ID"),
});

export const profileSlugSchema = z.object({
  slug: slugSchema,
});

export type CreateProfileSchema = z.infer<typeof createProfileSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
