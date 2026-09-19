import type { SocialLinks } from "./profile";
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
  socialLinks: SocialLinks;
  phone: string | null;
  email: string | null;
  categoryId: string | null;
  customCategory: string | null;
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
  socialLinks?: SocialLinks;
  phone?: string | null;
  email?: string | null;
  categoryId?: string | null;
  customCategory?: string | null;
}

export interface UpdateBusinessInput {
  name?: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  socialLinks?: SocialLinks;
  phone?: string | null;
  email?: string | null;
  categoryId?: string | null;
  customCategory?: string | null;
  status?: BusinessStatus;
}
