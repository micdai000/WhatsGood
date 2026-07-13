import type { ReactNode } from "react";
import { TrustBadge } from "@/components/badges";
import { Card, CardContent } from "@/components/ui/card";
import { Muted, Paragraph } from "@/components/typography/typography";
import { formatDate } from "@/lib/utils/format-date";
import type { PublicProfile } from "@/types";
import { cn } from "@/lib/utils";

interface ProfileStatsProps {
  profile: PublicProfile;
  className?: string;
}

interface StatItemProps {
  label: string;
  children: ReactNode;
  hint?: string;
}

function StatItem({ label, children, hint }: StatItemProps) {
  return (
    <div className="space-y-1 text-center">
      <div className="flex justify-center">{children}</div>
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
        <StatItem label="Trust badge">
          <TrustBadge tier={profile.badgeTier} size="md" />
        </StatItem>
        <StatItem label="Reviews">
          <Paragraph className="text-lg font-semibold tabular-nums sm:text-xl">
            {profile.totalReviews}
          </Paragraph>
        </StatItem>
        <StatItem label="Member since">
          <Paragraph className="text-lg font-semibold sm:text-xl">
            {memberSince}
          </Paragraph>
        </StatItem>
      </CardContent>
    </Card>
  );
}
