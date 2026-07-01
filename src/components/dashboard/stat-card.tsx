import { Muted, Paragraph } from "@/components/typography/typography";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <DashboardCard className={className}>
      <div className="space-y-1 text-center sm:text-left">
        <Paragraph className="text-2xl font-bold tabular-nums sm:text-3xl">
          {value}
        </Paragraph>
        <Muted className="text-xs uppercase tracking-wide">{label}</Muted>
        {hint ? <Muted className="text-[10px]">{hint}</Muted> : null}
      </div>
    </DashboardCard>
  );
}
