import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { TrustBadge } from "@/components/badges/trust-badge";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { AppImage } from "@/components/ui/app-image";
import { buttonVariants } from "@/components/ui/button";
import { StatusAlert } from "@/components/ui/status-alert";
import { Eyebrow, Muted, Paragraph } from "@/components/typography/typography";
import type { BadgeSubTier, BadgeTier } from "@/types";
import { cn } from "@/lib/utils";

interface LeaveReviewShellProps {
  title: string;
  description: string;
  profile: {
    displayName: string;
    avatar: string | null;
    professionName?: string | null;
    badgeTier?: BadgeTier;
    badgeSubTier?: BadgeSubTier | null;
    meta?: string;
  };
  backHref?: string;
  backLabel?: string;
  warning?: {
    title: string;
    description: string;
  };
  children: React.ReactNode;
  className?: string;
}

export function LeaveReviewShell({
  title,
  description,
  profile,
  backHref,
  backLabel = "Back to profile",
  warning,
  children,
  className,
}: LeaveReviewShellProps) {
  return (
    <PageWrapper variant="muted">
      <Container
        className={cn(
          "flex min-h-[calc(100dvh-4rem)] max-w-2xl flex-col py-8 sm:py-12",
          className,
        )}
      >
        {backHref ? (
          <Link
            to={backHref}
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "-ml-2 mb-6 inline-flex w-fit text-muted-foreground hover:text-primary",
            })}
          >
            <ArrowLeft className="size-4" aria-hidden />
            {backLabel}
          </Link>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-meritt-card)]">
          <div className="border-b border-border/80 bg-gradient-to-b from-muted/50 to-card px-6 py-6 sm:px-8 sm:py-7">
            <div className="space-y-5">
              <div className="space-y-2">
                <Eyebrow>Trust vote</Eyebrow>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {title}
                </h1>
                <Muted className="max-w-prose text-sm leading-relaxed sm:text-base">
                  {description}
                </Muted>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-border/80 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted shadow-sm ring-2 ring-primary/10">
                  {profile.avatar ? (
                    <AppImage
                      src={profile.avatar}
                      alt={`${profile.displayName}'s profile photo`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-primary/10 text-lg font-semibold text-primary">
                      {profile.displayName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Paragraph className="truncate text-lg font-semibold">
                    {profile.displayName}
                  </Paragraph>
                  <div className="flex flex-wrap items-center gap-2">
                    {profile.professionName ? (
                      <Muted className="text-sm">{profile.professionName}</Muted>
                    ) : null}
                    {profile.badgeTier ? (
                      <TrustBadge
                        tier={profile.badgeTier}
                        subTier={profile.badgeSubTier}
                        size="sm"
                      />
                    ) : null}
                  </div>
                  {profile.meta ? (
                    <Muted className="text-xs">{profile.meta}</Muted>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            {warning ? (
              <StatusAlert
                status="warning"
                title={warning.title}
                description={warning.description}
              />
            ) : null}
            {children}
          </div>
        </div>
      </Container>
    </PageWrapper>
  );
}
