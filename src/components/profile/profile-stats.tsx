import { Award, CalendarDays, MessageSquareText } from "lucide-react";
import { Muted } from "@/components/typography/typography";
import { formatBadgeLabel } from "@/lib/badges/display";
import { CURRENT_TIER_LABEL } from "@/lib/badges/reputation-copy";
import { formatDate } from "@/lib/utils/format-date";
import type { PublicProfile } from "@/types";
import { cn } from "@/lib/utils";

interface ProfileStatsProps {
  profile: PublicProfile;
  className?: string;
}

interface StatPillProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatPill({ icon, label, value }: StatPillProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-border/80 bg-card px-4 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {value}
        </p>
        <Muted className="text-xs">{label}</Muted>
      </div>
    </div>
  );
}

export function ProfileStats({ profile, className }: ProfileStatsProps) {
  const memberSince = formatDate(profile.memberSince, {
    month: "short",
    year: "numeric",
  });

  const experienceLabel =
    profile.totalReviews === 1
      ? "Verified client experience"
      : "Verified client experiences";

  const currentTierLabel = formatBadgeLabel(
    profile.badgeTier,
    profile.badgeSubTier,
  );

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-3",
        className,
      )}
    >
      <StatPill
        icon={<MessageSquareText className="size-4" aria-hidden />}
        label={experienceLabel}
        value={String(profile.totalReviews)}
      />
      <StatPill
        icon={<Award className="size-4" aria-hidden />}
        label={CURRENT_TIER_LABEL}
        value={currentTierLabel}
      />
      <StatPill
        icon={<CalendarDays className="size-4" aria-hidden />}
        label="Member since"
        value={memberSince}
      />
    </div>
  );
}
