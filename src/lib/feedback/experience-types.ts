export const EXPERIENCE_TYPES = [
  "Customer",
  "Client",
  "Student",
  "Visitor",
  "Other",
] as const;

export type ExperienceType = (typeof EXPERIENCE_TYPES)[number];
