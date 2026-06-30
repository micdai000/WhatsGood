"use client";

import { useState } from "react";
import { Share2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfileActionsProps {
  profileUrl: string;
  displayName: string;
  className?: string;
}

export function ProfileActions({
  profileUrl,
  displayName,
  className,
}: ProfileActionsProps) {
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    setSharing(true);

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `${displayName} on TrustLoop`,
          text: `Check out ${displayName}'s professional profile on TrustLoop.`,
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
      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto"
        disabled
        aria-disabled
        title="Review requests coming soon"
      >
        <MessageSquarePlus className="size-4" aria-hidden />
        Request Review
      </Button>
    </div>
  );
}
