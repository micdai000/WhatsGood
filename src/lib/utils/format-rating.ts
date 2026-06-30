export function formatRating(rating: number, decimals = 1): string {
  if (!Number.isFinite(rating)) return "0.0";
  return rating.toFixed(decimals);
}
