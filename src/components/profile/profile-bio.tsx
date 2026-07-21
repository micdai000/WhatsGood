import { SectionEyebrow } from "@/components/typography/typography";
import type { PublicProfile } from "@/types";
import { cn } from "@/lib/utils";

interface ProfileBioProps {
  profile: PublicProfile;
  className?: string;
}

export function ProfileBio({ profile, className }: ProfileBioProps) {
  if (!profile.bio?.trim()) {
    return null;
  }

  return (
    <section className={cn("space-y-3", className)} aria-labelledby="about-heading">
      <SectionEyebrow id="about-heading">About</SectionEyebrow>
      <div className="meritt-panel border-l-4 border-l-primary/40">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground sm:text-base">
          {profile.bio}
        </p>
      </div>
    </section>
  );
}
