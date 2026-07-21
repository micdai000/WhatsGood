import { MessageSquare, PenLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className={cn("border-dashed shadow-none", className)}>
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <MessageSquare className="size-6 text-muted-foreground" aria-hidden />
        </div>
        <div className="space-y-1">
          <H3 className="text-lg">No reviews yet</H3>
          <Muted className="max-w-sm text-sm">
            Be the first to share your experience working with {displayName}.
          </Muted>
        </div>
        {leaveReviewHref ? (
          <Link
            to={leaveReviewHref}
            className={buttonVariants({
              size: "lg",
              className:
                "gap-2 px-6 text-base font-semibold shadow-md ring-2 ring-primary/25",
            })}
          >
            <PenLine className="size-5" aria-hidden />
            Leave a review
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
