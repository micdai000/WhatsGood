import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ReputationTimeline } from "@/components/badges";
import { SectionEyebrow } from "@/components/typography/typography";
import {
  REPUTATION_HISTORY_LABEL,
  REPUTATION_RECENCY_WINDOW,
} from "@/lib/badges/reputation-copy";
import { Spinner } from "@/components/ui/spinner";
import { badgeService } from "@/services/badges";
import { profileService } from "@/services/profiles/profile.service";
import type { BadgeSnapshot } from "@/types";
import { isFailure } from "@/types";
import { cn } from "@/lib/utils";

const BADGE_HISTORY_LIMIT = 12;

interface ProfileReviewsSectionProps {
  slug: string;
  className?: string;
}

export function ProfileReviewsSection({
  slug,
  className,
}: ProfileReviewsSectionProps) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [badgeHistory, setBadgeHistory] = useState<BadgeSnapshot[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);

      const profileResult = await profileService.getProfileBySlug(slug);
      if (cancelled) return;

      if (isFailure(profileResult)) {
        if (profileResult.error.code === "NOT_FOUND") {
          setNotFound(true);
        }
        setLoading(false);
        return;
      }

      const historyResult = await badgeService.getBadgeHistory(
        profileResult.data.id,
        BADGE_HISTORY_LIMIT,
      );

      if (cancelled) return;

      setBadgeHistory(isFailure(historyResult) ? [] : historyResult.data);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <section
      className={cn("space-y-5", className)}
      id="reputation-history"
      aria-labelledby="reputation-heading"
    >
      <div className="space-y-1">
        <SectionEyebrow id="reputation-heading">Reputation history</SectionEyebrow>
        <p className="text-sm text-muted-foreground">
          {REPUTATION_HISTORY_LABEL} — monthly tiers from client feedback in the{" "}
          {REPUTATION_RECENCY_WINDOW}
        </p>
      </div>

      {badgeHistory.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <ReputationTimeline history={badgeHistory} showSectionHeader={false} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Badge history will appear here as monthly trust scores are recorded.
        </p>
      )}
    </section>
  );
}
