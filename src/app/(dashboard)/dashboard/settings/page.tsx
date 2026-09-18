import { Link, useSearchParams } from "react-router-dom";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import {
  ChangePasswordForm,
  DeleteAccountDialog,
  SignOutButton,
} from "@/components/settings";
import { AccountPhotoEditor } from "@/components/profile-fields/account-photo-editor";
import { StatusAlert } from "@/components/ui/status-alert";
import { Muted, Paragraph } from "@/components/typography/typography";
import { buttonVariants } from "@/components/ui/button";
import { brandCopy } from "@/lib/brand";
import { useAuthContext } from "@/contexts/auth-context";
import { useBusinessWorkspace } from "@/contexts/business-workspace-context";
import { getAccountDisplayName } from "@/lib/auth/display-name";
import { DELETE_ACCOUNT_DATA_SUMMARY } from "@/lib/copy/vocabulary";
import { persistAccountPhoto } from "@/lib/profile/persist-account-photo";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, refresh: refreshAuth } = useAuthContext();
  const { currentBusiness, refresh } = useBusinessWorkspace();
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");
  const email = user!.email;
  const displayName = getAccountDisplayName({
    fullName: user!.fullName,
    email,
  });
  const photoUrl = currentBusiness?.logoUrl ?? user!.avatarUrl;

  async function persistPhoto(url: string | null) {
    await persistAccountPhoto({
      url,
      businessId: currentBusiness?.id,
    });
    await Promise.all([refresh(), refreshAuth()]);
  }

  return (
    <div className="space-y-8">
      {error === "DELETE_ACCOUNT_FAILED" ? (
        <StatusAlert
          status="error"
          title="Unable to delete account"
          description="Something went wrong while deleting your account. Please try again or contact support."
        />
      ) : null}

      <DashboardCard title="Your profile">
        <AccountPhotoEditor
          value={photoUrl}
          displayName={displayName}
          onChange={persistPhoto}
        />
      </DashboardCard>

      <DashboardCard title="Email address">
        <div className="space-y-2">
          <Paragraph className="text-sm font-medium">{email}</Paragraph>
          <Muted className="text-xs">
            Email changes require verification and are not yet supported in-app.
            Contact support if you need to update your email address.
          </Muted>
        </div>
      </DashboardCard>

      <DashboardCard title="Change password">
        <ChangePasswordForm />
      </DashboardCard>

      <DashboardCard title="Business profile">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Muted className="text-sm">
            Update your business name, category, and contact details.
          </Muted>
          <Link
            to="/dashboard/profile"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Edit business
          </Link>
        </div>
      </DashboardCard>

      <DashboardCard title="Locations">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Muted className="text-sm">
            Manage the places customers visit.
          </Muted>
          <Link
            to="/dashboard/locations"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Manage locations
          </Link>
        </div>
      </DashboardCard>

      <DashboardCard title="Customer feedback">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Muted className="text-sm">
            See recent customer feedback for this business.
          </Muted>
          <Link
            to="/dashboard/feedback"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View feedback
          </Link>
        </div>
      </DashboardCard>

      {/* TODO: retire remaining professional-profile tools when that data is migrated. */}
      <DashboardCard title="Legacy professional profile">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Muted className="text-sm">
            Previous Meritt professional profile (username, bio, photo). This is
            no longer required to use Meritt.
          </Muted>
          <Link
            to="/dashboard/profile/edit"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Edit legacy profile
          </Link>
        </div>
      </DashboardCard>

      <DashboardCard title="Legacy feedback requests">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Muted className="text-sm">
            Older client feedback links. New businesses should use QR codes instead.
          </Muted>
          <Link
            to="/dashboard/review-requests"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Open legacy requests
          </Link>
        </div>
      </DashboardCard>

      <DashboardCard title="Session">
        <div className="space-y-3">
          <Muted className="text-sm">{brandCopy.signOutDevice}</Muted>
          <SignOutButton />
        </div>
      </DashboardCard>

      <DashboardCard title="Delete account" className="border-destructive/30">
        <div className="space-y-3">
          <Muted className="text-sm">{DELETE_ACCOUNT_DATA_SUMMARY}</Muted>
          <DeleteAccountDialog />
        </div>
      </DashboardCard>
    </div>
  );
}
