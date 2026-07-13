import { Link, Navigate } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuthContext } from "@/contexts/auth-context";
import { useServiceQuery } from "@/hooks/use-service-query";
import { profileService } from "@/services/profiles/profile.service";
import { professionService } from "@/services/professions/profession.service";
import { cn } from "@/lib/utils";

export default function EditProfilePage() {
  const { user } = useAuthContext();
  const profileResult = useServiceQuery(
    () => profileService.getProfile(user!.id),
    [user?.id],
  );

  const username =
    profileResult.status === "success" ? profileResult.data.username : null;

  const publicProfileResult = useServiceQuery(
    () => profileService.getPublicProfile(username!),
    [username],
  );

  const professionsResult = useServiceQuery(
    () => professionService.getProfessions(),
    [],
  );

  if (
    profileResult.status === "loading" ||
    (username && publicProfileResult.status === "loading") ||
    professionsResult.status === "loading"
  ) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (profileResult.status === "error") {
    return <Navigate to="/welcome" replace />;
  }

  const profile = profileResult.data;
  const publicProfile =
    publicProfileResult.status === "success" ? publicProfileResult.data : null;
  const professions =
    professionsResult.status === "success" ? professionsResult.data : [];

  return (
    <Section>
      <Container className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageHeader
            title="Edit profile"
            description="Update how you appear on your public Meritt profile."
          />
          <Link
            to={`/u/${profile.username}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            target="_blank"
            rel="noopener noreferrer"
          >
            View public profile
          </Link>
        </div>

        <EditProfileForm
          profile={profile}
          professions={professions}
          stats={{
            totalReviews: publicProfile?.totalReviews ?? 0,
            badgeTier: publicProfile?.badgeTier ?? "none",
            badgePeriod: publicProfile?.badgePeriod ?? null,
          }}
        />
      </Container>
    </Section>
  );
}
