import { ExternalLink, MessageSquarePlus, Pencil, Search, Settings } from "lucide-react";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { QuickActionCard } from "@/components/dashboard/quick-action-card";
import { Paragraph } from "@/components/typography/typography";
import { buttonVariants } from "@/components/ui/button";
import type { DashboardProfile } from "@/types";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  profile: DashboardProfile;
  className?: string;
}

export function QuickActions({ profile, className }: QuickActionsProps) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-2", className)}>
      <DashboardCard title="Your public profile">
        <div className="space-y-4">
          <Paragraph className="break-all text-sm font-medium">
            {profile.publicProfileUrl}
          </Paragraph>
          <div className="flex flex-wrap gap-3">
            <CopyLinkButton url={profile.publicProfileUrl} label="Copy profile link" />
            <a
              href={profile.publicProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              <ExternalLink className="size-4" aria-hidden />
              View profile
            </a>
          </div>
        </div>
      </DashboardCard>

      <div className="grid gap-4">
        <QuickActionCard
          title="Edit profile"
          description="Update your name, bio, photo, and public profile URL."
          href="/dashboard/profile/edit"
          icon={Pencil}
        />
        <QuickActionCard
          title="Request a review"
          description="Generate a unique link to share with a client."
          href="/dashboard/review-requests"
          icon={MessageSquarePlus}
        />
        <QuickActionCard
          title="Account settings"
          description="Change your password, sign out, or manage your account."
          href="/dashboard/settings"
          icon={Settings}
        />
        <QuickActionCard
          title="Discover professionals"
          description="See how others appear in TrustLoop search."
          href="/search"
          icon={Search}
        />
      </div>
    </div>
  );
}
