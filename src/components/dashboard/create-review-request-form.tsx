"use client";

import { useState, useTransition } from "react";
import { createReviewRequestAction } from "@/app/actions/review-request.actions";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusAlert } from "@/components/ui/status-alert";
import { Paragraph } from "@/components/typography/typography";
import { cn } from "@/lib/utils";

interface CreateReviewRequestFormProps {
  className?: string;
}

export function CreateReviewRequestForm({ className }: CreateReviewRequestFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setShareUrl(null);

    startTransition(async () => {
      const result = await createReviewRequestAction({ email });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setShareUrl(result.data.shareUrl);
      setEmail("");
    });
  }

  return (
    <div className={cn("space-y-4", className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clientEmail">Client email</Label>
          <Input
            id="clientEmail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="client@example.com"
            disabled={isPending}
            required
          />
          <Paragraph className="text-xs text-muted-foreground">
            We&apos;ll generate a unique link you can share manually. Email delivery is
            coming in a future update.
          </Paragraph>
        </div>

        {error ? (
          <StatusAlert status="error" title="Unable to create request" description={error} />
        ) : null}

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Creating…" : "Generate review link"}
        </Button>
      </form>

      {shareUrl ? (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <Paragraph className="text-sm font-medium">Share this link with your client</Paragraph>
          <Paragraph className="break-all text-sm text-muted-foreground">{shareUrl}</Paragraph>
          <CopyLinkButton url={shareUrl} label="Copy review link" />
        </div>
      ) : null}
    </div>
  );
}
