import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionTitle, Muted } from "@/components/typography/typography";
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
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="pb-2">
        <SectionTitle as="h2">About</SectionTitle>
      </CardHeader>
      <CardContent>
        <Muted className="whitespace-pre-wrap leading-relaxed">{profile.bio}</Muted>
      </CardContent>
    </Card>
  );
}
