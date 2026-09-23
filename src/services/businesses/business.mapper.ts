import type { Business, DiscoverableBusiness, SocialLinks } from "@/types";
import type { ReputationTier } from "@/types/reputation";
import { BUSINESS_STATUSES, type BusinessStatus } from "@/types/business";
import { REPUTATION_TIERS } from "@/types/reputation";
import { displayCategoryName } from "@/lib/business/categories";
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
  custom_category?: string | null;
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

export type DiscoverableBusinessRow = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  is_claimed?: boolean;
  custom_category?: string | null;
  current_reputation_tier: string;
  current_reputation_period: string | null;
  total_feedback: number | null;
  business_categories:
    | { name: string; slug?: string | null }
    | { name: string; slug?: string | null }[]
    | null;
  business_locations:
    | Array<{ city: string | null; state: string | null; is_primary: boolean }>
    | null;
};

export function mapDiscoverableBusiness(
  row: DiscoverableBusinessRow,
): DiscoverableBusiness {
  const categoryRel = row.business_categories;
  const category = Array.isArray(categoryRel) ? categoryRel[0] : categoryRel;
  const locations = row.business_locations ?? [];
  const primary = locations.find((location) => location.is_primary) ?? locations[0];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    isClaimed: Boolean(row.is_claimed),
    logoUrl: row.logo_url,
    categoryName: displayCategoryName(category, row.custom_category),
    city: primary?.city ?? null,
    state: primary?.state ?? null,
    reputationTier: asReputationTier(row.current_reputation_tier),
    reputationPeriod: row.current_reputation_period,
    totalFeedback: row.total_feedback ?? 0,
  };
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
    customCategory: row.custom_category ?? null,
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
