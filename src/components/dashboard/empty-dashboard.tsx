import { LayoutDashboard } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { H3, Muted } from "@/components/typography/typography";
import { cn } from "@/lib/utils";

interface EmptyDashboardProps {
  title: string;
  description: string;
  className?: string;
}

export function EmptyDashboard({ title, description, className }: EmptyDashboardProps) {
  return (
    <DashboardCard className={cn("border-dashed shadow-none", className)}>
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <LayoutDashboard className="size-6 text-muted-foreground" aria-hidden />
        </div>
        <div className="space-y-1">
          <H3 className="text-lg">{title}</H3>
          <Muted className="max-w-sm text-sm">{description}</Muted>
        </div>
      </div>
    </DashboardCard>
  );
}
