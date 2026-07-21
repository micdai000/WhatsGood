export const MONTHLY_VOTE_LIMIT_MESSAGE =
  "You have already submitted a trust vote for this professional this month. You can vote again next month.";

export function getVoteMonthStart(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function getNextVoteEligibleAt(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
}

export function formatNextVoteEligibleAt(date: Date = new Date()): string {
  return getNextVoteEligibleAt(date).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
