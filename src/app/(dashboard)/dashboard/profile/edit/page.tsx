import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { buttonVariants } from "@/components/ui/button";
import { authService } from "@/services/auth/auth.service";
import { profileService } from "@/services/profiles/profile.service";
import { professionService } from "@/services/professions/profession.service";
import { isFailure, isSuccess } from "@/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const sessionResult = await authService.getSession();

  if (!isSuccess(sessionResult) || !sessionResult.data) {
    redirect("/login");
  }

  const userId = sessionResult.data.user.id;
  const profileResult = await profileService.getProfile(userId);

  if (isFailure(profileResult)) {
    redirect("/welcome");
  }

  const profile = profileResult.data;

  const [publicProfileResult, professionsResult] = await Promise.all([
    profileService.getPublicProfile(profile.username),
    professionService.getProfessions(),
  ]);

  const publicProfile = isSuccess(publicProfileResult)
    ? publicProfileResult.data
    : null;

  const professions = isSuccess(professionsResult) ? professionsResult.data : [];

  return (
    <Section>
      <Container className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageHeader
            title="Edit profile"
            description="Update how you appear on your public TrustLoop profile."
          />
          <Link
            href={`/u/${profile.username}`}
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
            averageRating: publicProfile?.averageRating ?? 0,
            totalReviews: publicProfile?.totalReviews ?? 0,
          }}
        />
      </Container>
    </Section>
  );
}
