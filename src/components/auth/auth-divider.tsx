import { Separator } from "@/components/ui/separator";
import { Caption } from "@/components/typography/typography";

interface AuthDividerProps {
  label?: string;
}

export function AuthDivider({ label = "or" }: AuthDividerProps) {
  return (
    <div className="relative my-6">
      <Separator />
      <Caption className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2">
        {label}
      </Caption>
    </div>
  );
}
