import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CopyLinkButtonProps {
  url: string;
  label?: string;
  className?: string;
}

export function CopyLinkButton({
  url,
  label = "Copy link",
  className,
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Unable to copy link");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCopy}
      className={cn("w-full sm:w-auto", className)}
    >
      {copied ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
      {copied ? "Copied" : label}
    </Button>
  );
}
