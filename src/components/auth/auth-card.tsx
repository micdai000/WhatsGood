import { SITE_NAME } from "@/lib/seo/site";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  children,
  className,
}: AuthCardProps) {
  return (
    <Card className={cn("w-full max-w-md border-border shadow-[var(--shadow-meritt-card)]", className)}>
      <CardHeader className="text-center">
        <p className="text-sm font-semibold text-foreground">{SITE_NAME}</p>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description ? (
          <CardDescription>{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
