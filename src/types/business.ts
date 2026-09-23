import type { ReputationTier } from "./reputation";

export const BUSINESS_STATUSES = ["active", "suspended", "archived"] as const;

export type BusinessStatus = (typeof BUSINESS_STATUSES)[number];

export interface Business {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  phone: string | null;
  email: string | null;
  categoryId: string | null;
  status: BusinessStatus;
  isClaimed: boolean;
  currentReputationScore: number | null;
  currentReputationTier: ReputationTier;
  currentReputationPeriod: string | null;
  totalFeedback: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessInput {
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  categoryId?: string | null;
}

export interface DiscoverableBusiness {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  categoryName: string | null;
  city: string | null;
  state: string | null;
  reputationTier: ReputationTier;
  reputationPeriod: string | null;
  totalFeedback: number;
}

export interface UpdateBusinessInput {
  name?: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  categoryId?: string | null;
  status?: BusinessStatus;
}
