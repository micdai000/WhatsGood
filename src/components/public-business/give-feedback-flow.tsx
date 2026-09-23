import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusAlert } from "@/components/ui/status-alert";
import { Muted, Paragraph } from "@/components/typography/typography";
import { EXPERIENCE_TYPES, type ExperienceType } from "@/lib/feedback/experience-types";
import { buildSubmitFeedbackInput } from "@/lib/feedback/build-submit-input";
import {
  KEPT_WORD_OPTIONS,
  TREATED_OPTIONS,
  VISIT_OUTCOMES,
  WORTH_IT_OPTIONS,
  visitFeedbackLines,
  type KeptWordId,
  type TreatedId,
  type VisitOutcomeId,
  type WorthItId,
} from "@/lib/feedback/visit-signals";
import { feedbackService } from "@/services/feedback";
import { useAuthContext } from "@/contexts/auth-context";
import { isFailure } from "@/types";
import type { PublicBusinessQrCode } from "@/types";
import { cn } from "@/lib/utils";

export function GiveFeedbackFlow({
  businessId,
  businessName,
  qr,
}: {
  businessId: string;
  businessName: string;
  qr?: PublicBusinessQrCode | null;
}) {
  const { user } = useAuthContext();
  const [visit, setVisit] = useState<VisitOutcomeId | null>(null);
  const [keptWord, setKeptWord] = useState<KeptWordId | null>(null);
  const [worthIt, setWorthIt] = useState<WorthItId | null>(null);
  const [treated, setTreated] = useState<TreatedId | null>(null);
  const [experienceType, setExperienceType] = useState<ExperienceType | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = Boolean(visit && keptWord && worthIt && treated && experienceType);

  async function submit() {
    if (!visit || !keptWord || !worthIt || !treated || !experienceType) return;
    setSubmitting(true);
    setError(null);
    const result = await feedbackService.submitFeedback(
      buildSubmitFeedbackInput({
        businessId,
        qr,
        experienceType,
        feedback: { visit, keptWord, worthIt, treated },
      }),
    );
    setSubmitting(false);
    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }
    setSubmitted(true);
  }

  if (submitted && visit && keptWord && worthIt && treated && experienceType) {
    const lines = visitFeedbackLines(
      { visit, keptWord, worthIt, treated },
      experienceType,
    );
    return (
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold tracking-tight">This visit is recorded.</h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <Paragraph className="text-muted-foreground">
          It counts toward the current reputation of {businessName}. Older visits fade,
          so Bronze, Silver, Gold, and Elite reflect what is recent.
        </Paragraph>
        {user ? null : (
          <Link to="/signup" className={cn(buttonVariants({ variant: "ghost" }), "px-0")}>
            Create a Meritt account
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">How was this visit?</h2>
        <Muted>
          Same questions for every visit. No comments. These taps move {businessName} through
          Bronze, Silver, Gold, and Elite.
        </Muted>
      </div>

      {error ? (
        <StatusAlert status="error" title="Unable to submit feedback" description={error} />
      ) : null}

      <ChoiceCards
        label="Would you come back?"
        value={visit}
        options={VISIT_OUTCOMES}
        disabled={submitting}
        onChange={setVisit}
      />

      <div className="space-y-4">
        <h3 className="text-sm font-medium">What was true of this visit?</h3>
        <SegmentedChoice
          label="Did they do what they said?"
          value={keptWord}
          options={KEPT_WORD_OPTIONS}
          disabled={submitting}
          onChange={setKeptWord}
        />
        <SegmentedChoice
          label="Was it worth it?"
          value={worthIt}
          options={WORTH_IT_OPTIONS}
          disabled={submitting}
          onChange={setWorthIt}
        />
        <SegmentedChoice
          label="How were you treated?"
          value={treated}
          options={TREATED_OPTIONS}
          disabled={submitting}
          onChange={setTreated}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Which fits this visit?</h3>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Which fits this visit?">
          {EXPERIENCE_TYPES.map((type) => {
            const selected = experienceType === type;
            return (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={submitting}
                onClick={() => setExperienceType(type)}
                className={cn(choiceClass(selected), "min-h-11 px-3")}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          className="min-h-11 w-full"
          disabled={!ready || submitting}
          onClick={() => void submit()}
        >
          {submitting ? "Submitting…" : "Submit this visit"}
        </Button>
        {ready ? (
          <Muted className="text-xs">You can change any answer before you submit.</Muted>
        ) : (
          <Muted className="text-xs">Answer each part of this visit.</Muted>
        )}
      </div>
    </div>
  );
}

function ChoiceCards<T extends string>({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: T | null;
  options: readonly { id: T; label: string; description: string }[];
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{label}</h3>
      <div className="grid gap-2" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(option.id)}
              className={cn(choiceClass(selected), "w-full px-4 py-3 text-left")}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SegmentedChoice<T extends string>({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: T | null;
  options: readonly { id: T; label: string }[];
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(option.id)}
              className={cn(choiceClass(selected), "min-h-11 px-2")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function choiceClass(selected: boolean) {
  return cn(
    "rounded-xl border text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    selected
      ? "border-foreground bg-muted text-foreground shadow-sm"
      : "border-border bg-background text-foreground hover:bg-muted/60",
  );
}
