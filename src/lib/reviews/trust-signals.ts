export type TrustSignal = "promote" | "maintain" | "demote";

export interface TrustSignalOption {
  signal: TrustSignal;
  /** Maps to the 1–5 review rating stored for trust-score math. */
  value: number;
  label: string;
  description: string;
  wouldRecommend: boolean;
}

export const EXPERIENCE_FEEDBACK_HEADING = "How was your experience?";

export const EXPERIENCE_FEEDBACK_SUBMIT_LABEL = "Submit feedback";

/**
 * Customer-facing experience options on the review form.
 *
 * Ratings are stored as 5 / 3 / 1 internally for the reputation algorithm.
 */
export const TRUST_SIGNALS: readonly TrustSignalOption[] = [
  {
    signal: "promote",
    value: 5,
    label: "Great",
    description: "I'd recommend them.",
    wouldRecommend: true,
  },
  {
    signal: "maintain",
    value: 3,
    label: "Good",
    description: "I'd hire them again.",
    wouldRecommend: true,
  },
  {
    signal: "demote",
    value: 1,
    label: "Poor",
    description: "I wouldn't recommend them.",
    wouldRecommend: false,
  },
] as const;

export const TRUST_SIGNAL_BY_VALUE: Record<number, TrustSignalOption> =
  Object.fromEntries(TRUST_SIGNALS.map((option) => [option.value, option]));

export const TRUST_SIGNAL_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Poor",
  3: "Good",
  4: "Great",
  5: "Great",
};

const LEGACY_TRUST_SIGNAL_LABELS: Record<TrustSignal, string> = {
  promote: "Promote",
  maintain: "Maintain",
  demote: "Demote",
};

export function getTrustSignalLabel(rating: number): string {
  return TRUST_SIGNAL_LABELS[rating] ?? "Review";
}

export function getTrustSignalOption(
  rating: number,
): TrustSignalOption | undefined {
  return TRUST_SIGNAL_BY_VALUE[rating];
}

export function getWouldRecommendForRating(rating: number): boolean {
  return getTrustSignalOption(rating)?.wouldRecommend ?? rating >= 3;
}

export function buildTrustVoteReviewContent(
  rating: number,
  professionalName: string,
): { title: string; body: string } {
  const label = getTrustSignalLabel(rating);
  return {
    title: `${label} experience`,
    body: `${label} experience with ${professionalName}.`,
  };
}

function isLegacyTrustVotePlaceholder(
  review: { title: string; body: string; rating: number },
  option: TrustSignalOption,
): boolean {
  const legacyLabel = LEGACY_TRUST_SIGNAL_LABELS[option.signal];
  return (
    review.title === `${legacyLabel} trust vote` &&
    review.body.startsWith(`${legacyLabel} trust vote for `) &&
    review.body.endsWith(".")
  );
}

export function isTrustVotePlaceholder(review: {
  title: string;
  body: string;
  rating: number;
}): boolean {
  const option = getTrustSignalOption(review.rating);
  if (!option) {
    return false;
  }

  const label = option.label;

  if (
    review.title === `${label} experience` &&
    review.body.startsWith(`${label} experience with `) &&
    review.body.endsWith(".")
  ) {
    return true;
  }

  return isLegacyTrustVotePlaceholder(review, option);
}

export const TRUST_VOTE_PAST_LABELS: Record<TrustSignal, string> = {
  promote: "Recommended them",
  maintain: "Would hire again",
  demote: "Wouldn't recommend",
};

export function getTrustVotePastLabel(rating: number): string | null {
  const option = getTrustSignalOption(rating);
  return option ? TRUST_VOTE_PAST_LABELS[option.signal] : null;
}
