import { cn } from "@/lib/utils";

interface SectionProps extends React.ComponentProps<"section"> {
  spacing?: "default" | "tight" | "loose";
}

const spacingClasses = {
  tight: "py-8 sm:py-10",
  default: "py-10 sm:py-14",
  loose: "py-14 sm:py-20",
} as const;

export function Section({
  className,
  spacing = "default",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(spacingClasses[spacing], className)}
      {...props}
    />
  );
}
