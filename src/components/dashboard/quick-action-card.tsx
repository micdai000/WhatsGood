import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Paragraph, Muted } from "@/components/typography/typography";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  variant?: "default" | "outline";
  className?: string;
}

export function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  variant = "default",
  className,
}: QuickActionCardProps) {
  const content = (
    <div className="flex items-start gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="min-w-0 space-y-1">
        <Paragraph className="font-medium">{title}</Paragraph>
        <Muted className="text-sm">{description}</Muted>
      </div>
    </div>
  );

  if (href) {
    return (
      <DashboardCard className={cn("transition-shadow hover:shadow-md", className)}>
        <Link
          to={href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "h-auto w-full justify-start whitespace-normal p-0 hover:bg-transparent",
          )}
        >
          {content}
        </Link>
      </DashboardCard>
    );
  }

  return <DashboardCard className={className}>{content}</DashboardCard>;
}
