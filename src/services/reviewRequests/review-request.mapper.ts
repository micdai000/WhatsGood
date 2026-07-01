import type { ReviewRequest, ReviewRequestStatus } from "@/types";

export type ReviewRequestRow = {
  id: string;
  profile_id: string;
  email: string;
  token: string;
  status: ReviewRequestStatus;
  created_at: string;
  expires_at: string;
  completed_at: string | null;
};

export type ReviewRequestWithProfileRow = ReviewRequestRow & {
  profiles: { username: string; display_name: string } | null;
};

export function mapReviewRequestRow(row: ReviewRequestRow): ReviewRequest {
  return {
    id: row.id,
    profileId: row.profile_id,
    email: row.email,
    token: row.token,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    completedAt: row.completed_at,
  };
}

export function mapReviewRequestWithProfileRow(
  row: ReviewRequestWithProfileRow,
): ReviewRequest & { profileUsername: string; profileDisplayName: string } {
  return {
    ...mapReviewRequestRow(row),
    profileUsername: row.profiles?.username ?? "",
    profileDisplayName: row.profiles?.display_name ?? "",
  };
}
