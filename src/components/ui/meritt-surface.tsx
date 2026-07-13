import { cn } from "@/lib/utils";

interface MerittCardProps extends React.ComponentProps<"div"> {
  padding?: "none" | "sm" | "md";
}

/** Outer card shell — matches themeritt.com preview containers */
export function MerittCard({
  className,
  padding = "md",
  ...props
}: MerittCardProps) {
  return (
    <div
      className={cn(
        "meritt-card",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        padding === "none" && "p-0",
        className,
      )}
      {...props}
    />
  );
}

/** Inner panel — matches themeritt.com live-preview panels */
export function MerittPanel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("meritt-panel", className)} {...props} />;
}

interface MerittSectionProps extends React.ComponentProps<"section"> {
  variant?: "default" | "surface" | "white";
}

export function MerittSection({
  className,
  variant = "default",
  ...props
}: MerittSectionProps) {
  return (
    <section
      className={cn(
        "meritt-section",
        variant === "white" && "meritt-section-white",
        variant === "surface" && "meritt-section-surface",
        className,
      )}
      {...props}
    />
  );
}
