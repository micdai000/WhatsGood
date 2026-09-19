import type { Business, SocialLinks } from "@/types";
import type { ReputationTier } from "@/types/reputation";
import { BUSINESS_STATUSES, type BusinessStatus } from "@/types/business";
import { REPUTATION_TIERS } from "@/types/reputation";
import { socialLinksForBusiness } from "@/lib/profile/social-links";

export type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  social_links?: SocialLinks | Record<string, unknown> | null;
  phone: string | null;
  email: string | null;
  category_id: string | null;
  status: string;
  is_claimed: boolean;
  current_reputation_score: number | string | null;
  current_reputation_tier: string;
  current_reputation_period: string | null;
  total_feedback: number;
  created_at: string;
  updated_at: string;
};

function asBusinessStatus(value: string): BusinessStatus {
  return (BUSINESS_STATUSES as readonly string[]).includes(value)
    ? (value as BusinessStatus)
    : "active";
}

function asReputationTier(value: string): ReputationTier {
  return (REPUTATION_TIERS as readonly string[]).includes(value)
    ? (value as ReputationTier)
    : "building";
}

export function mapBusinessRow(row: BusinessRow): Business {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    logoUrl: row.logo_url,
    websiteUrl: row.website_url,
    socialLinks: socialLinksForBusiness({
      socialLinks: row.social_links,
      websiteUrl: row.website_url,
    }),
    phone: row.phone,
    email: row.email,
    categoryId: row.category_id,
    status: asBusinessStatus(row.status),
    isClaimed: row.is_claimed,
    currentReputationScore:
      row.current_reputation_score === null
        ? null
        : Number(row.current_reputation_score),
    currentReputationTier: asReputationTier(row.current_reputation_tier),
    currentReputationPeriod: row.current_reputation_period,
    totalFeedback: row.total_feedback,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
