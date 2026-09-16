export interface ReputationFeedback {
  id: string;
  businessId: string;
  locationId: string | null;
  submittedByUserId: string | null;
  qrCodeId: string | null;
  wouldRecommend: boolean | null;
  experienceType: string | null;
  feedbackData: Record<string, unknown>;
  verified: boolean;
  createdAt: string;
}

export interface SubmitFeedbackInput {
  businessId: string;
  locationId?: string | null;
  qrCodeId?: string | null;
  wouldRecommend?: boolean | null;
  experienceType?: string | null;
  feedbackData?: Record<string, unknown>;
}
