/**
 * Structured visit feedback.
 *
 * Stars collapse a visit into one inflated number. Comment boxes turn into
 * rants, extortion, and reviews that cannot be compared. A yes/no recommend
 * forces a side and hides an honest "it was fine."
 *
 * Every visitor gets the same taps. "Okay" is stored as a real outcome and
 * does not count as a recommendation or a rejection. Bronze, Silver, Gold,
 * and Elite stay the business standing those recent visits move.
 */

export const VISIT_OUTCOMES = [
  {
    id: "recommend",
    label: "I'd recommend them",
    description: "I'd send someone here.",
    wouldRecommend: true,
  },
  {
    id: "okay",
    label: "It was okay",
    description: "Fine for what it was.",
    wouldRecommend: null,
  },
  {
    id: "would_not",
    label: "I wouldn't go back",
    description: "I wouldn't recommend them.",
    wouldRecommend: false,
  },
] as const;

export type VisitOutcomeId = (typeof VISIT_OUTCOMES)[number]["id"];

export const KEPT_WORD_OPTIONS = [
  { id: "yes", label: "Yes" },
  { id: "partly", label: "Partly" },
  { id: "no", label: "No" },
] as const;

export const WORTH_IT_OPTIONS = KEPT_WORD_OPTIONS;

export const TREATED_OPTIONS = [
  { id: "well", label: "Well" },
  { id: "fair", label: "Fair" },
  { id: "poorly", label: "Poorly" },
] as const;

export type KeptWordId = (typeof KEPT_WORD_OPTIONS)[number]["id"];
export type WorthItId = (typeof WORTH_IT_OPTIONS)[number]["id"];
export type TreatedId = (typeof TREATED_OPTIONS)[number]["id"];

export interface VisitFeedback {
  visit: VisitOutcomeId;
  keptWord: KeptWordId;
  worthIt: WorthItId;
  treated: TreatedId;
}

const VISIT_IDS = new Set<string>(VISIT_OUTCOMES.map((option) => option.id));
const TERNARY_IDS = new Set<string>(KEPT_WORD_OPTIONS.map((option) => option.id));
const TREATED_IDS = new Set<string>(TREATED_OPTIONS.map((option) => option.id));

const OUTCOME_SUMMARY: Record<VisitOutcomeId, string> = {
  recommend: "Would recommend",
  okay: "Okay visit",
  would_not: "Would not go back",
};

const KEPT_WORD_SUMMARY: Record<KeptWordId, string> = {
  yes: "Did what they said",
  partly: "Partly did what they said",
  no: "Did not do what they said",
};

const WORTH_IT_SUMMARY: Record<WorthItId, string> = {
  yes: "Worth it",
  partly: "Partly worth it",
  no: "Not worth it",
};

const TREATED_SUMMARY: Record<TreatedId, string> = {
  well: "Treated well",
  fair: "Treated fairly",
  poorly: "Treated poorly",
};

export function wouldRecommendForVisit(visit: VisitOutcomeId): boolean | null {
  return VISIT_OUTCOMES.find((option) => option.id === visit)?.wouldRecommend ?? null;
}

export function buildVisitFeedbackData(
  feedback: VisitFeedback,
): Record<string, unknown> {
  return {
    visit: feedback.visit,
    keptWord: feedback.keptWord,
    worthIt: feedback.worthIt,
    treated: feedback.treated,
  };
}

function readId<T extends string>(value: unknown, allowed: Set<string>): T | null {
  return typeof value === "string" && allowed.has(value) ? (value as T) : null;
}

export function readVisitFeedback(
  feedbackData: Record<string, unknown> | null | undefined,
): VisitFeedback | null {
  if (!feedbackData) return null;
  const visit = readId<VisitOutcomeId>(feedbackData.visit, VISIT_IDS);
  const keptWord = readId<KeptWordId>(feedbackData.keptWord, TERNARY_IDS);
  const worthIt = readId<WorthItId>(feedbackData.worthIt, TERNARY_IDS);
  const treated = readId<TreatedId>(feedbackData.treated, TREATED_IDS);
  if (!visit || !keptWord || !worthIt || !treated) return null;
  return { visit, keptWord, worthIt, treated };
}

export function summarizeFeedback(input: {
  wouldRecommend: boolean | null;
  experienceType: string | null;
  feedbackData?: Record<string, unknown> | null;
}): { title: string; lines: string[] } {
  const stored = readVisitFeedback(input.feedbackData);
  const title = stored
    ? OUTCOME_SUMMARY[stored.visit]
    : input.wouldRecommend == null
      ? "Experience submitted"
      : input.wouldRecommend
        ? "Would recommend"
        : "Would not recommend";

  const lines = stored
    ? [
        KEPT_WORD_SUMMARY[stored.keptWord],
        WORTH_IT_SUMMARY[stored.worthIt],
        TREATED_SUMMARY[stored.treated],
      ]
    : [];

  if (input.experienceType) {
    lines.push(input.experienceType);
  }

  return { title, lines };
}

export function visitFeedbackLines(feedback: VisitFeedback, experienceType: string): string[] {
  return [
    VISIT_OUTCOMES.find((option) => option.id === feedback.visit)?.label ?? "",
    KEPT_WORD_SUMMARY[feedback.keptWord],
    WORTH_IT_SUMMARY[feedback.worthIt],
    TREATED_SUMMARY[feedback.treated],
    experienceType,
  ].filter(Boolean);
}
