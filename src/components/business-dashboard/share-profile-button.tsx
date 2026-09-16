import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareProfileButton({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  async function share() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text: `See ${title} on Meritt.`,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied");
    } catch {
      toast.error("Unable to share this profile");
    }
  }

  return (
    <Button type="button" variant="outline" onClick={() => void share()}>
      Share Profile
    </Button>
  );
}
