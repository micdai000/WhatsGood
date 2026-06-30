import { cva, type VariantProps } from "class-variance-authority";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const statusAlertVariants = cva("", {
  variants: {
    status: {
      default: "",
      success:
        "border-success/30 bg-success/5 text-foreground [&_[data-slot=alert-description]]:text-muted-foreground",
      warning:
        "border-warning/30 bg-warning/5 text-foreground [&_[data-slot=alert-description]]:text-muted-foreground",
      error:
        "border-destructive/30 bg-destructive/5 text-foreground [&_[data-slot=alert-description]]:text-muted-foreground",
    },
  },
  defaultVariants: {
    status: "default",
  },
});

interface StatusAlertProps
  extends Omit<React.ComponentProps<typeof Alert>, "variant">,
    VariantProps<typeof statusAlertVariants> {
  title: string;
  description?: string;
}

export function StatusAlert({
  title,
  description,
  status = "default",
  className,
  children,
  ...props
}: StatusAlertProps) {
  return (
    <Alert
      className={cn(statusAlertVariants({ status }), className)}
      variant={status === "error" ? "destructive" : "default"}
      {...props}
    >
      <AlertTitle>{title}</AlertTitle>
      {description ? <AlertDescription>{description}</AlertDescription> : null}
      {children}
    </Alert>
  );
}
