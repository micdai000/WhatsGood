import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { EmptyDashboard } from "@/components/dashboard/empty-dashboard";
import { LoadingState } from "@/components/layout/loading-state";
import { ErrorState } from "@/components/layout/error-state";
import { Muted } from "@/components/typography/typography";
import { useBusinessWorkspace } from "@/contexts/business-workspace-context";
import { feedbackService } from "@/services/feedback";
import { summarizeFeedback } from "@/lib/feedback/visit-signals";
import { isFailure } from "@/types";
import type { ReputationFeedback } from "@/types";

export default function DashboardFeedbackPage() {
  const { currentBusiness } = useBusinessWorkspace();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ReputationFeedback[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!currentBusiness) return;
    let cancelled = false;
    setLoading(true);

    feedbackService
      .getFeedbackForBusiness(currentBusiness.id, { page: 1, limit: 20 })
      .then((listResult) => {
        if (cancelled) return;
        setLoading(false);
        if (isFailure(listResult)) {
          setError(listResult.error.message);
          return;
        }
        setItems(listResult.data.items);
        setTotal(listResult.data.total);
      });

    return () => {
      cancelled = true;
    };
  }, [currentBusiness]);

  if (!currentBusiness) {
    return null;
  }

  if (loading) {
    return <LoadingState label="Loading feedback…" />;
  }

  if (error) {
    return <ErrorState title="Unable to load feedback" description={error} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Feedback
        </p>
        <p className="mt-2 text-4xl font-semibold tracking-tight">
          {total}
        </p>
        <Muted className="mt-2 text-sm">Recent customer feedback.</Muted>
      </div>

      {items.length === 0 ? (
        <EmptyDashboard
          title="No customer feedback yet"
          description="Share your QR code so customers can report their current experience."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const summary = summarizeFeedback(item);
            return (
              <li key={item.id}>
                <DashboardCard>
                  <div className="space-y-1">
                    <p className="font-medium">{summary.title}</p>
                    <Muted className="text-sm">
                      {[...summary.lines, new Date(item.createdAt).toLocaleDateString()]
                        .filter(Boolean)
                        .join(" · ")}
                    </Muted>
                  </div>
                </DashboardCard>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-sm">
        <Link to="/dashboard/qr" className="text-primary underline-offset-4 hover:underline">
          View QR Code
        </Link>
      </p>
    </div>
  );
}
