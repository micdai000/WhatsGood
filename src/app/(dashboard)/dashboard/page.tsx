import { Link } from "react-router-dom";
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
          <Link
            to="/dashboard/feedback"
            className="underline-offset-4 hover:underline"
          >
            {currentBusiness.totalFeedback}
          </Link>
        </p>
      </div>

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
