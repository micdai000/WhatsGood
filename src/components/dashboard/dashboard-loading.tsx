import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function StatSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 rounded-xl border p-6", className)}>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-3 w-48" />
      <div className="flex h-40 items-end gap-2">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-full flex-1 rounded-t-md" />
        ))}
      </div>
    </div>
  );
}

export function DashboardLoading() {
  return (
    <Section>
      <Container className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
        <PageHeader
          title="Welcome back"
          description="Loading your analytics and recent activity…"
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <StatSkeleton key={index} />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <div className="grid gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </Container>
    </Section>
  );
}
