export type ReviewRequestStatus = "pending" | "completed" | "expired";

export interface ReviewRequest {
  id: string;
  profileId: string;
  email: string;
  token: string;
  status: ReviewRequestStatus;
  createdAt: string;
}

export interface CreateReviewRequestInput {
  profileId: string;
  email: string;
}
