import { useState } from "react";
import { Link } from "react-router-dom";
import { Share2, PenLine } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfileActionsProps {
  profileUrl: string;
  displayName: string;
  leaveReviewHref: string;
  className?: string;
}

export function ProfileActions({
  profileUrl,
  displayName,
  leaveReviewHref,
  className,
}: ProfileActionsProps) {
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    setSharing(true);

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `${displayName} on Meritt`,
          text: `Check out ${displayName}'s professional profile on Meritt.`,
          url: profileUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied to clipboard");
    } catch {
      toast.error("Unable to share profile link");
    } finally {
      setSharing(false);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap",
        className,
      )}
    >
      <Button
        type="button"
        className="w-full sm:w-auto"
        onClick={handleShare}
        disabled={sharing}
      >
        <Share2 className="size-4" aria-hidden />
        Share Profile
      </Button>
      <Link
        to={leaveReviewHref}
        className={buttonVariants({
          size: "lg",
          className:
            "w-full gap-2 px-6 text-base font-semibold shadow-md ring-2 ring-primary/25 sm:w-auto",
        })}
      >
        <PenLine className="size-5" aria-hidden />
        Leave a Review
      </Link>
    </div>
  );
}
