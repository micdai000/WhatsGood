import { Link, useSearchParams } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import {
  ChangePasswordForm,
  DeleteAccountDialog,
  SignOutButton,
} from "@/components/settings";
import { StatusAlert } from "@/components/ui/status-alert";
import { Muted, Paragraph } from "@/components/typography/typography";
import { buttonVariants } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuthContext();
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");
  const email = user!.email;

  return (
    <Section>
      <Container size="narrow" className="space-y-8">
        <PageHeader
          title="Account settings"
          description="Manage your sign-in credentials and account preferences."
        />

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

        <DashboardCard title="Profile">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Muted className="text-sm">
              Update your display name, username, bio, photo, and location.
            </Muted>
            <Link
              to="/dashboard/profile/edit"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Edit profile
            </Link>
          </div>
        </DashboardCard>

        <DashboardCard title="Session">
          <div className="space-y-3">
            <Muted className="text-sm">
              Sign out of Meritt on this device.
            </Muted>
            <SignOutButton />
          </div>
        </DashboardCard>

        <DashboardCard title="Delete account" className="border-destructive/30">
          <div className="space-y-3">
            <Muted className="text-sm">
              Permanently delete your account, profile, reviews, and review requests.
            </Muted>
            <DeleteAccountDialog />
          </div>
        </DashboardCard>
      </Container>
    </Section>
  );
}
