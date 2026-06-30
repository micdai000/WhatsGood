export interface Review {
  id: string;
  profileId: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  reviewText: string | null;
  serviceDescription: string | null;
  verified: boolean;
  createdAt: string;
}

export interface CreateReviewInput {
  profileId: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  reviewText?: string | null;
  serviceDescription?: string | null;
  reviewRequestToken?: string;
}
