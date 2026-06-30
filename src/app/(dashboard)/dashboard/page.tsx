import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { Paragraph, Muted } from "@/components/typography/typography";
import { buttonVariants } from "@/components/ui/button";
import { StatusAlert } from "@/components/ui/status-alert";
import { authService } from "@/services/auth/auth.service";
import { profileService } from "@/services/profiles/profile.service";
import { getSiteUrl } from "@/lib/auth/routes";
import { cn } from "@/lib/utils";
import { isFailure, isSuccess } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const sessionResult = await authService.getSession();

  if (!isSuccess(sessionResult) || !sessionResult.data) {
    redirect("/login");
  }

  const profileResult = await profileService.getProfile(
    sessionResult.data.user.id,
  );

  if (isFailure(profileResult)) {
    redirect("/welcome");
  }

  const profile = profileResult.data;
  const publicUrl = `${getSiteUrl()}/@${profile.username}`;
  const displayName = profile.displayName;

  return (
    <Section>
      <Container className="space-y-6">
        <PageHeader
          title={`Welcome, ${displayName.split(" ")[0]}`}
          description="Your professional profile is live."
        />

        <StatusAlert status="success" title="Profile created" description="Your TrustLoop profile has been published. Share your link with clients to start collecting verified reviews." />

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <Muted className="text-xs uppercase tracking-wide">
            Public profile URL
          </Muted>
          <Paragraph className="mt-2 break-all font-medium">{publicUrl}</Paragraph>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants()}
            >
              View public profile
            </a>
            <Link
              href="/dashboard"
              className={buttonVariants({ variant: "outline" })}
            >
              Go to dashboard home
            </Link>
          </div>
        </div>

        <Paragraph className="max-w-2xl text-muted-foreground">
          Dashboard features like reviews, analytics, and profile editing are
          coming in future phases.
        </Paragraph>
      </Container>
    </Section>
  );
}
