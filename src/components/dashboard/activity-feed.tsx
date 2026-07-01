import { MessageSquare, Send, Star, Timer } from "lucide-react";
import { Muted, Paragraph } from "@/components/typography/typography";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { formatDate } from "@/lib/utils/format-date";
import type { DashboardActivityItem, DashboardActivityType } from "@/types";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  items: DashboardActivityItem[];
  className?: string;
}

const ICONS: Record<DashboardActivityType, typeof Star> = {
  review_received: Star,
  review_request_created: Send,
  review_request_completed: MessageSquare,
  review_request_expired: Timer,
};

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <DashboardCard title="Recent activity">
      <ul className={cn("space-y-4", className)} aria-label="Recent activity">
        {items.map((item) => {
          const Icon = ICONS[item.type];

          return (
            <li key={item.id} className="flex gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className="size-4 text-muted-foreground" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <Paragraph className="text-sm font-medium">{item.title}</Paragraph>
                <Muted className="text-xs">{item.description}</Muted>
                <Muted className="text-[10px] tabular-nums">
                  {formatDate(item.timestamp, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Muted>
              </div>
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}
