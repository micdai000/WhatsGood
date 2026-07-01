import { PageHeader } from "@/components/layout/page-header";
import type { DashboardProfile } from "@/types";

interface DashboardHeaderProps {
  profile: DashboardProfile;
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const firstName = profile.displayName.split(" ")[0] || profile.displayName;

  return (
    <PageHeader
      title={`Welcome back, ${firstName}`}
      description="Your analytics hub — track reviews, requests, and what to do next."
    />
  );
}
