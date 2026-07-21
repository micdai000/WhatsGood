import { useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { createReviewAction } from "@/app/actions/review.actions";
import { TrustSignalInput } from "@/components/reviews/trust-signal-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusAlert } from "@/components/ui/status-alert";
import { getPublicProfileUrl } from "@/lib/profile/public-url";
import {
  buildTrustVoteReviewContent,
  getWouldRecommendForRating,
} from "@/lib/reviews/trust-signals";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  slug: string;
  displayName: string;
  requestToken?: string;
  prefilledEmail?: string;
  lockEmail?: boolean;
  className?: string;
}

type FormState = {
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
};

const initialState: FormState = {
  reviewerName: "",
  reviewerEmail: "",
  rating: 0,
};

function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function ReviewForm({
  slug,
  displayName,
  requestToken,
  prefilledEmail,
  lockEmail = false,
  className,
}: ReviewFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    ...initialState,
    reviewerEmail: prefilledEmail ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function fieldError(field: string): string | null {
    return fieldErrors[field]?.[0] ?? null;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (form.rating < 1) {
      setFieldErrors({
        rating: ["Choose Promote, Maintain, or Demote"],
      });
      return;
    }

    const { title, body } = buildTrustVoteReviewContent(form.rating, displayName);

    startTransition(async () => {
      const result = await createReviewAction({
        ...(requestToken ? { requestToken } : { slug }),
        reviewerName: form.reviewerName,
        reviewerEmail: form.reviewerEmail,
        rating: form.rating,
        title,
        body,
        wouldRecommend: getWouldRecommendForRating(form.rating),
        relationship: null,
      });

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setFormError(result.message);
        return;
      }

      toast.success("Thank you! Your trust vote has been submitted.");
      navigate(getPublicProfileUrl(slug));
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-8", className)}
      noValidate
    >
      {formError ? (
        <StatusAlert status="error" title="Unable to submit review" description={formError} />
      ) : null}

      <FormSection
        title="About you"
        description="Only your name is shown publicly. You can submit one trust vote per month per professional."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="reviewerName">Your name</Label>
            <Input
              id="reviewerName"
              name="reviewerName"
              autoComplete="name"
              value={form.reviewerName}
              onChange={(event) => updateField("reviewerName", event.target.value)}
              aria-invalid={Boolean(fieldError("reviewerName"))}
              disabled={isPending}
              required
            />
            {fieldError("reviewerName") ? (
              <p className="text-sm text-destructive">{fieldError("reviewerName")}</p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="reviewerEmail">Your email</Label>
            <Input
              id="reviewerEmail"
              name="reviewerEmail"
              type="email"
              autoComplete="email"
              value={form.reviewerEmail}
              onChange={(event) => updateField("reviewerEmail", event.target.value)}
              aria-invalid={Boolean(fieldError("reviewerEmail"))}
              disabled={isPending || lockEmail}
              readOnly={lockEmail}
              required
            />
            {lockEmail ? (
              <p className="text-xs text-muted-foreground">
                Tied to your invitation and cannot be changed.
              </p>
            ) : null}
            {fieldError("reviewerEmail") ? (
              <p className="text-sm text-destructive">{fieldError("reviewerEmail")}</p>
            ) : null}
          </div>
        </div>
      </FormSection>

      <div className="border-t border-border/80 pt-8">
        <FormSection
          title={`Your vote for ${displayName}`}
          description="Choose whether their trust badge should move up, hold steady, or move down this month."
        >
          <TrustSignalInput
            value={form.rating}
            onChange={(value) => updateField("rating", value)}
            disabled={isPending}
            error={fieldError("rating")}
          />
        </FormSection>
      </div>

      <div className="border-t border-border/80 pt-6">
        <Button
          type="submit"
          size="lg"
          className="w-full gap-2 text-base font-semibold shadow-md sm:w-auto sm:min-w-[12rem]"
          disabled={isPending}
        >
          {isPending ? "Submitting…" : "Submit trust vote"}
        </Button>
      </div>
    </form>
  );
}
