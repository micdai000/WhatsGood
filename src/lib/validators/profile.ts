import { z } from "zod";
import { LIMITS } from "@/lib/constants";
import { isAllowedProfilePhotoUrl } from "./profile-photo";

const slugSchema = z
  .string()
  .min(1, "Username is required")
  .max(LIMITS.SLUG_MAX_LENGTH)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Username must contain only lowercase letters, numbers, and hyphens",
  );

const fullNameSchema = z
  .string()
  .min(
    LIMITS.FULL_NAME_MIN_LENGTH,
    `Display name must be at least ${LIMITS.FULL_NAME_MIN_LENGTH} characters`,
  )
  .max(
    LIMITS.FULL_NAME_MAX_LENGTH,
    `Display name must be ${LIMITS.FULL_NAME_MAX_LENGTH} characters or fewer`,
  );

const bioSchema = z
  .string()
  .max(LIMITS.BIO_MAX_LENGTH, `Bio must be ${LIMITS.BIO_MAX_LENGTH} characters or fewer`);

const locationFieldSchema = z
  .string()
  .min(1, "This field is required")
  .max(
    LIMITS.LOCATION_MAX_LENGTH,
    `Must be ${LIMITS.LOCATION_MAX_LENGTH} characters or fewer`,
  );

export const createProfileSchema = z.object({
  slug: slugSchema,
  fullName: fullNameSchema,
  professionId: z.string().uuid("Please select a profession"),
  bio: bioSchema.nullable().optional(),
  city: locationFieldSchema,
  state: locationFieldSchema,
  profilePhoto: z
    .string()
    .url()
    .nullable()
    .optional()
    .refine(
      (url) => url == null || isAllowedProfilePhotoUrl(url),
      "Profile photo must be uploaded through TrustLoop",
    ),
});

export const updateProfileSchema = createProfileSchema.partial();

export const profileIdSchema = z.object({
  id: z.string().uuid("Invalid profile ID"),
});

export const profileSlugSchema = z.object({
  slug: slugSchema,
});

export const onboardingProfessionSchema = z.object({
  professionId: z.string().uuid("Please select a profession"),
});

export const onboardingDisplayNameSchema = z.object({
  fullName: fullNameSchema,
});

export const onboardingUsernameSchema = z.object({
  slug: slugSchema,
});

export const onboardingBioSchema = z.object({
  bio: bioSchema,
});

export const onboardingLocationSchema = z.object({
  city: locationFieldSchema,
  state: locationFieldSchema,
});

export type CreateProfileSchema = z.infer<typeof createProfileSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
