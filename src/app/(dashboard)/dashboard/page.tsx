import { Link } from "react-router-dom";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { buttonVariants } from "@/components/ui/button";
import { Muted } from "@/components/typography/typography";
import { useBusinessWorkspace } from "@/contexts/business-workspace-context";
import {
  formatDashboardReputation,
  getDashboardNextAction,
} from "@/lib/dashboard/home";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { currentBusiness } = useBusinessWorkspace();

  if (!currentBusiness) {
    return null;
  }

  const reputation = formatDashboardReputation(
    currentBusiness.currentReputationTier,
    currentBusiness.totalFeedback,
  );
  const action = getDashboardNextAction(currentBusiness.totalFeedback);

  return (
    <div className="max-w-md space-y-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Current reputation
        </p>
        <p className="mt-2 text-4xl font-semibold tracking-tight">{reputation}</p>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Feedback
        </p>
        <p className="mt-2 text-4xl font-semibold tracking-tight">
          {currentBusiness.totalFeedback}
        </p>
      </div>

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

      <Link
        to="/dashboard/qr"
        className={cn(buttonVariants({ size: "lg" }), "min-h-11")}
      >
        View QR Code
      </Link>

      <div className="space-y-1">
        <p className="font-medium">{action.title}</p>
        <Muted className="text-sm">{action.description}</Muted>
      </div>
    </div>
  );
}
