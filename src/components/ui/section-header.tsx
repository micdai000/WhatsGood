import { Link } from "react-router-dom";
import { SectionTitle, Muted } from "@/components/typography/typography";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-5", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <SectionTitle>{title}</SectionTitle>
        {actionLabel && actionHref ? (
          <Link
            to={actionHref}
            className="shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {subtitle ? <Muted className="mt-1">{subtitle}</Muted> : null}
    </div>
  );
}
