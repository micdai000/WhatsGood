import { Badge } from "@/components/ui/badge";
import {
  getTrustSignalOption,
  type TrustSignal,
} from "@/lib/reviews/trust-signals";
import { cn } from "@/lib/utils";

const VOTE_BADGE_STYLES: Record<TrustSignal, string> = {
  promote:
    "border-violet-500/30 bg-violet-500/10 text-violet-900 dark:text-violet-100",
  maintain:
    "border-slate-500/30 bg-slate-500/10 text-slate-900 dark:text-slate-100",
  demote:
    "border-amber-600/30 bg-amber-500/10 text-amber-950 dark:text-amber-100",
};

interface TrustVoteBadgeProps {
  rating: number;
  className?: string;
}

export function TrustVoteBadge({ rating, className }: TrustVoteBadgeProps) {
  const option = getTrustSignalOption(rating);
  if (!option) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        VOTE_BADGE_STYLES[option.signal],
        className,
      )}
    >
      {option.label}
    </Badge>
  );
}
