import { ShieldOff } from "lucide-react";
import { Muted, Paragraph } from "@/components/typography/typography";

interface AdminEmptyStateProps {
  title: string;
  description: string;
}

export function AdminEmptyState({ title, description }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <ShieldOff className="size-5 text-muted-foreground" aria-hidden />
      </div>
      <div className="space-y-1">
        <Paragraph className="font-medium">{title}</Paragraph>
        <Muted className="max-w-sm text-sm">{description}</Muted>
      </div>
    </div>
  );
}
