import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Muted } from "@/components/typography/typography";
import { summarizeFeedback } from "@/lib/feedback/visit-signals";
import { cn } from "@/lib/utils";
import type { ReputationFeedback } from "@/types";

interface FeedbackItemProps {
  item: ReputationFeedback;
}

export function FeedbackItem({ item }: FeedbackItemProps) {
  const [expanded, setExpanded] = useState(false);
  const summary = summarizeFeedback(item);
  const panelId = useId();
  const triggerId = useId();
  const dateLabel = new Date(item.createdAt).toLocaleDateString();

  return (
    <Card size="sm" className="border-border shadow-[var(--shadow-meritt-card)]">
      <CardContent className="pt-3">
        <button
          type="button"
          id={triggerId}
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center gap-3 text-left"
          aria-expanded={expanded}
          aria-controls={panelId}
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="font-medium">{summary.title}</p>
              <Muted className="text-xs">{dateLabel}</Muted>
            </div>
            {!expanded && item.experienceType ? (
              <Muted className="mt-1 text-xs">{item.experienceType}</Muted>
            ) : null}
          </div>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        {expanded ? (
          <dl
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
            className="mt-4 space-y-3 border-t border-border/80 pt-4"
          >
            {summary.answers.map((answer) => (
              <div key={answer.question} className="space-y-0.5">
                <dt>
                  <Muted className="text-xs">{answer.question}</Muted>
                </dt>
                <dd className="text-sm font-medium">{answer.answer}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </CardContent>
    </Card>
  );
}
