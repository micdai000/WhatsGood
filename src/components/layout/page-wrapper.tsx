import { cn } from "@/lib/utils";

interface PageWrapperProps extends React.ComponentProps<"div"> {
  variant?: "default" | "muted";
}

export function PageWrapper({
  className,
  variant = "default",
  ...props
}: PageWrapperProps) {
  return (
    <div
      className={cn(
        "min-h-dvh w-full bg-background",
        variant === "muted" && "bg-muted/60",
        className,
      )}
      {...props}
    />
  );
}
