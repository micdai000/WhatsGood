import type { ReputationFeedback } from "@/types";

export type FeedbackRow = {
  id: string;
  business_id: string;
  location_id: string | null;
  submitted_by_user_id: string | null;
  qr_code_id: string | null;
  would_recommend: boolean | null;
  experience_type: string | null;
  feedback_data: Record<string, unknown> | null;
  verified: boolean;
  created_at: string;
};

export function mapFeedbackRow(row: FeedbackRow): ReputationFeedback {
  return {
    id: row.id,
    businessId: row.business_id,
    locationId: row.location_id,
    submittedByUserId: row.submitted_by_user_id,
    qrCodeId: row.qr_code_id,
    wouldRecommend: row.would_recommend,
    experienceType: row.experience_type,
    feedbackData: row.feedback_data ?? {},
    verified: row.verified,
    createdAt: row.created_at,
  };
}
