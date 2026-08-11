import { Muted, SectionEyebrow } from "@/components/typography/typography";
import { brandCopy } from "@/lib/brand";
import type { PublicProfile } from "@/types";
import { cn } from "@/lib/utils";

interface ProfileBioProps {
  profile: PublicProfile;
  className?: string;
}

function formatMemberSinceLabel(memberSince: string): string | null {
  const date = new Date(memberSince);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${brandCopy.memberSincePrefix} ${date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })}`;
}

export function ProfileBio({ profile, className }: ProfileBioProps) {
  if (!profile.bio?.trim()) {
    return null;
  }

  const memberSinceLabel = formatMemberSinceLabel(profile.memberSince);

  return (
    <section className={cn("space-y-3", className)} aria-labelledby="about-heading">
      <SectionEyebrow id="about-heading">About the professional</SectionEyebrow>
      {memberSinceLabel ? (
        <Muted className="text-xs">{memberSinceLabel}</Muted>
      ) : null}
      <div className="meritt-panel border-l-4 border-l-primary/40">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground sm:text-base">
          {profile.bio}
        </p>
      </div>
    </section>
  );
}
