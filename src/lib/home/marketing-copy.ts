import { SITE_NAME } from "@/lib/seo/site";

export const HOME_HERO_EYEBROW = SITE_NAME;

export const HOME_HERO_TITLE = "Know who you can trust.";

export const HOME_HERO_SUBTITLE =
  "See current reputation for businesses, built from recent customer feedback.";

export const HOME_PRIMARY_CTA = "Find a business";

export const HOME_PRO_CTA = "Build your reputation";

export const HOME_FEATURED_EYEBROW = "Current reputation";

export const HOME_FEATURED_TITLE = "Highest current reputation";

export const HOME_FEATURED_SUBTITLE =
  "Businesses with the strongest recent reputation.";

export const HOME_HOW_IT_WORKS_STEPS = [
  {
    title: "Search",
    description: "Pick a category and location to see who is trusted right now.",
  },
  {
    title: "Compare",
    description: "Review current reputation and recent customer feedback.",
  },
  {
    title: "Choose",
    description: "Decide with confidence based on how a business is doing today.",
  },
] as const;
