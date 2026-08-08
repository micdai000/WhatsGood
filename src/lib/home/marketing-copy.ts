import { SITE_NAME } from "@/lib/seo/site";

export const HOME_HERO_EYEBROW = SITE_NAME;

export const HOME_HERO_TITLE = "Know who you can trust.";

export const HOME_HERO_SUBTITLE =
  "Find professionals with current, verified reputations — not outdated star ratings.";

export const HOME_PRIMARY_CTA = "Find a professional";

export const HOME_PRO_CTA = "Build your reputation";

export const HOME_FEATURED_EYEBROW = "Current reputation";

export const HOME_FEATURED_TITLE = "Highest current reputation";

export const HOME_FEATURED_SUBTITLE =
  "Professionals with the strongest recent reputation.";

export const HOME_HOW_IT_WORKS_STEPS = [
  {
    title: "Search",
    description: "Pick a profession and location to see who is trusted right now.",
  },
  {
    title: "Compare",
    description: "Review current tiers, recent client feedback, and reputation history.",
  },
  {
    title: "Choose",
    description: "Hire with confidence based on how they perform today.",
  },
] as const;
