export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const RATING = {
  MIN: 1,
  MAX: 5,
} as const;

export const LIMITS = {
  SLUG_MAX_LENGTH: 200,
  FULL_NAME_MIN_LENGTH: 2,
  FULL_NAME_MAX_LENGTH: 100,
  BIO_MAX_LENGTH: 1000,
  LOCATION_MAX_LENGTH: 100,
  REVIEW_TEXT_MAX_LENGTH: 2000,
  SERVICE_DESCRIPTION_MAX_LENGTH: 500,
  PASSWORD_MIN_LENGTH: 8,
  PROFILE_PHOTO_MAX_BYTES: 5 * 1024 * 1024,
} as const;

export const DEFAULTS = {
  AVATAR_URL: "/images/default-avatar.svg",
  AVERAGE_RATING: 0,
  TOTAL_REVIEWS: 0,
} as const;

export const REVIEW_REQUEST = {
  TOKEN_EXPIRY_DAYS: 30,
  STATUSES: ["pending", "completed", "expired"] as const,
} as const;

export const ONBOARDING = {
  STORAGE_KEY: "trustloop-onboarding-v1",
  TOTAL_STEPS: 8,
} as const;
