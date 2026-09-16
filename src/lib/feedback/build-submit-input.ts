import type { PublicBusinessQrCode, SubmitFeedbackInput } from "@/types";

export function buildSubmitFeedbackInput(options: {
  businessId: string;
  qr?: PublicBusinessQrCode | null;
  wouldRecommend: boolean;
  experienceType: string;
}): SubmitFeedbackInput {
  return {
    businessId: options.businessId,
    wouldRecommend: options.wouldRecommend,
    experienceType: options.experienceType,
    qrCodeId: options.qr?.id ?? null,
    locationId: options.qr?.locationId ?? null,
    feedbackData: {},
  };
}
