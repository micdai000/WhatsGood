"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Muted, Paragraph } from "@/components/typography/typography";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { formatDate } from "@/lib/utils/format-date";
import { getReviewRequestUrl } from "@/lib/review-request/public-url";
import type { ReviewRequest } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReviewRequestCardProps {
  request: ReviewRequest;
  className?: string;
}

const STATUS_LABELS = {
  pending: "Pending",
  completed: "Completed",
  expired: "Expired",
} as const;

const STATUS_VARIANTS = {
  pending: "secondary",
  completed: "default",
  expired: "outline",
} as const;

export function ReviewRequestCard({ request, className }: ReviewRequestCardProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = getReviewRequestUrl(request.token);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Review link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Unable to copy link");
    }
  }

  return (
    <DashboardCard className={cn(className)}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <Paragraph className="truncate font-medium">{request.email}</Paragraph>
            <Muted className="text-xs">
              Created {formatDate(request.createdAt)}
            </Muted>
          </div>
          <Badge variant={STATUS_VARIANTS[request.status]}>
            {STATUS_LABELS[request.status]}
          </Badge>
        </div>

        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {request.completedAt ? (
            <div>
              <dt className="text-muted-foreground">Completed</dt>
              <dd>{formatDate(request.completedAt)}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-muted-foreground">
              {request.status === "expired" ? "Expired" : "Expires"}
            </dt>
            <dd>{formatDate(request.expiresAt)}</dd>
          </div>
        </dl>

        {request.status === "pending" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
            Copy review link
          </Button>
        ) : null}
      </div>
    </DashboardCard>
  );
}
