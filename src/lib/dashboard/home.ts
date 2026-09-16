import type { ReputationTier } from "@/types";

export function formatDashboardReputation(
  tier: ReputationTier,
  totalFeedback: number,
): string {
  if (totalFeedback === 0 || tier === "building") {
    return "Building";
  }

  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function getDashboardNextAction(totalFeedback: number): {
  title: string;
  description: string;
} {
  if (totalFeedback === 0) {
    return {
      title: "Get more feedback",
      description: "Put your Meritt QR code where customers can see it.",
    };
  }

  return {
    title: "Keep your reputation current",
    description: "Keep your QR code available to customers.",
  };
}
