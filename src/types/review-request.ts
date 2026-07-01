export type ReviewRequestStatus = "pending" | "completed" | "expired";

export interface ReviewRequest {
  id: string;
  profileId: string;
  email: string;
  token: string;
  status: ReviewRequestStatus;
  createdAt: string;
  expiresAt: string;
  completedAt: string | null;
}

export interface ReviewRequestWithProfile extends ReviewRequest {
  profileUsername: string;
  profileDisplayName: string;
}

export interface CreateReviewRequestInput {
  profileId: string;
  email: string;
}
