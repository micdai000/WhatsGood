import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
}: SectionHeaderProps) {
  return (
    <div className="mb-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-[#111] tracking-tight sm:text-xl">{title}</h2>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="text-[13px] font-semibold text-neutral-400 hover:text-[#111] transition-colors"
          >
            {actionLabel}
          </Link>
        )}
      </div>
      {subtitle && (
        <p className="text-[13px] text-neutral-400 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
