import { MessageSquare, PenLine } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { H3, Muted } from "@/components/typography/typography";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface EmptyReviewsProps {
  displayName: string;
  leaveReviewHref?: string;
  className?: string;
}

export function EmptyReviews({
  displayName,
  leaveReviewHref,
  className,
}: EmptyReviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
        <MessageSquare className="size-6 text-primary" aria-hidden />
      </div>
      <div className="max-w-sm space-y-1">
        <H3 className="text-lg">No reviews yet</H3>
        <Muted className="text-sm">
          Be the first to share your experience working with {displayName}.
        </Muted>
      </div>
      {leaveReviewHref ? (
        <Link
          to={leaveReviewHref}
          className={buttonVariants({ size: "lg", className: "gap-2" })}
        >
          <PenLine className="size-4" aria-hidden />
          Leave a review
        </Link>
      ) : null}
    </div>
  );
}
