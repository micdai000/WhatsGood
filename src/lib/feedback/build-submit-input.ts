import type { PublicBusinessQrCode, SubmitFeedbackInput } from "@/types";
import {
  buildVisitFeedbackData,
  wouldRecommendForVisit,
  type VisitFeedback,
} from "@/lib/feedback/visit-signals";

export function buildSubmitFeedbackInput(options: {
  businessId: string;
  qr?: PublicBusinessQrCode | null;
  experienceType: string;
  feedback: VisitFeedback;
}): SubmitFeedbackInput {
  return {
    businessId: options.businessId,
    wouldRecommend: wouldRecommendForVisit(options.feedback.visit),
    experienceType: options.experienceType,
    qrCodeId: options.qr?.id ?? null,
    locationId: options.qr?.locationId ?? null,
    feedbackData: { ...buildVisitFeedbackData(options.feedback) },
  };
}
