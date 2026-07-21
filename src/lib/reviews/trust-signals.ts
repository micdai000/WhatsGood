export type TrustSignal = "promote" | "maintain" | "demote";

export interface TrustSignalOption {
  signal: TrustSignal;
  /** Maps to the 1–5 review rating stored for trust-score math. */
  value: number;
  label: string;
  description: string;
  wouldRecommend: boolean;
}

/**
 * Three-way trust vote used on the review form.
 *
 * Ratings are stored as 5 / 3 / 1 so promote and demote pull the Bayesian
 * average clearly apart while maintain sits at the profession mean anchor.
 */
export const TRUST_SIGNALS: readonly TrustSignalOption[] = [
  {
    signal: "promote",
    value: 5,
    label: "Promote",
    description: "Great experience — helps them move toward a higher badge",
    wouldRecommend: true,
  },
  {
    signal: "maintain",
    value: 3,
    label: "Maintain",
    description: "Solid experience — supports their current badge standing",
    wouldRecommend: true,
  },
  {
    signal: "demote",
    value: 1,
    label: "Demote",
    description: "Below expectations — pulls their badge standing down",
    wouldRecommend: false,
  },
] as const;

export const TRUST_SIGNAL_BY_VALUE: Record<number, TrustSignalOption> =
  Object.fromEntries(TRUST_SIGNALS.map((option) => [option.value, option]));

export const TRUST_SIGNAL_LABELS: Record<number, string> = {
  1: "Demote",
  2: "Demote",
  3: "Maintain",
  4: "Promote",
  5: "Promote",
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
    title: `${label} trust vote`,
    body: `${label} trust vote for ${professionalName}.`,
  };
}

export function isTrustVotePlaceholder(review: {
  title: string;
  body: string;
  rating: number;
}): boolean {
  const label = getTrustSignalLabel(review.rating);
  if (label === "Review") {
    return false;
  }

  return (
    review.title === `${label} trust vote` &&
    review.body.startsWith(`${label} trust vote for `) &&
    review.body.endsWith(".")
  );
}

export const TRUST_VOTE_PAST_LABELS: Record<TrustSignal, string> = {
  promote: "Promoted",
  maintain: "Maintained",
  demote: "Demoted",
};

export function getTrustVotePastLabel(rating: number): string | null {
  const option = getTrustSignalOption(rating);
  return option ? TRUST_VOTE_PAST_LABELS[option.signal] : null;
}
