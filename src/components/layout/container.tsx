import { cn } from "@/lib/utils";

interface ContainerProps extends React.ComponentProps<"div"> {
  size?: "default" | "narrow" | "wide";
}

const sizeClasses = {
  default: "max-w-[1180px]",
  narrow: "max-w-3xl",
  wide: "max-w-[1180px]",
} as const;

export function Container({
  className,
  size = "default",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
