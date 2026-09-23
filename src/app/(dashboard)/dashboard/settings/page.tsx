import { Link, useSearchParams } from "react-router-dom";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import {
  ChangePasswordForm,
  DeleteAccountDialog,
  SignOutButton,
} from "@/components/settings";
import { StatusAlert } from "@/components/ui/status-alert";
import { Muted, Paragraph } from "@/components/typography/typography";
import { buttonVariants } from "@/components/ui/button";
import { brandCopy } from "@/lib/brand";
import { useAuthContext } from "@/contexts/auth-context";
import { DELETE_ACCOUNT_DATA_SUMMARY } from "@/lib/copy/vocabulary";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuthContext();
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");
  const email = user!.email;

  return (
    <div className="space-y-8">
      {error === "DELETE_ACCOUNT_FAILED" ? (
        <StatusAlert
          status="error"
          title="Unable to delete account"
          description="Something went wrong while deleting your account. Please try again or contact support."
        />
      ) : null}

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
            Update your business name, category, contact details, and logo.
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
