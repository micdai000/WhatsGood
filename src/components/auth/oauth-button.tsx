import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OAuthButtonProps {
  provider?: string;
  className?: string;
}

export function OAuthButton({
  provider = "Google",
  className,
}: OAuthButtonProps) {
  return (
    <button
      type="button"
      disabled
      className={cn(
        buttonVariants({ variant: "outline" }),
        "w-full opacity-60",
        className,
      )}
      aria-disabled
    >
      Continue with {provider}
      <span className="sr-only"> (coming soon)</span>
    </button>
  );
}
