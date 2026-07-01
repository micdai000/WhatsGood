import { Card, CardContent } from "@/components/ui/card";
import { Muted, Paragraph } from "@/components/typography/typography";
import { formatDate } from "@/lib/utils/format-date";
import { formatRating } from "@/lib/utils/format-rating";
import type { PublicProfile } from "@/types";
import { cn } from "@/lib/utils";

interface ProfileStatsProps {
  profile: PublicProfile;
  className?: string;
}

interface StatItemProps {
  label: string;
  value: string;
  hint?: string;
}

function StatItem({ label, value, hint }: StatItemProps) {
  return (
    <div className="space-y-1 text-center">
      <Paragraph className="text-lg font-semibold tabular-nums sm:text-xl">
        {value}
      </Paragraph>
      <Muted className="text-xs">{label}</Muted>
      {hint ? <Muted className="text-[10px]">{hint}</Muted> : null}
    </div>
  );
}

export function ProfileStats({ profile, className }: ProfileStatsProps) {
  const memberSince = formatDate(profile.memberSince, {
    month: "long",
    year: "numeric",
  });

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="grid grid-cols-3 gap-4 py-5">
        <StatItem
          label="Average rating"
          value={formatRating(profile.averageRating)}
          hint="Coming soon"
        />
        <StatItem
          label="Reviews"
          value={String(profile.totalReviews)}
          hint="Coming soon"
        />
        <StatItem label="Member since" value={memberSince} />
      </CardContent>
    </Card>
  );
}
