export interface Review {
  id: string;
  profileId: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title: string;
  body: string;
  wouldRecommend: boolean;
  relationship: string | null;
  verified: boolean;
  createdAt: string;
}

export interface CreateReviewInput {
  profileId: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title: string;
  body: string;
  wouldRecommend: boolean;
  relationship?: string | null;
  reviewRequestId?: string | null;
}

export interface RatingBreakdown {
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
  total: number;
}
