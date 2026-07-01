import type { Review } from "@/types";

export type ReviewRow = {
  id: string;
  profile_id: string;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;
  title: string;
  body: string;
  would_recommend: boolean;
  relationship: string | null;
  verified: boolean;
  created_at: string;
};

export function mapReviewRow(row: ReviewRow): Review {
  return {
    id: row.id,
    profileId: row.profile_id,
    reviewerName: row.reviewer_name,
    reviewerEmail: row.reviewer_email,
    rating: row.rating,
    title: row.title,
    body: row.body,
    wouldRecommend: row.would_recommend,
    relationship: row.relationship,
    verified: row.verified,
    createdAt: row.created_at,
  };
}
