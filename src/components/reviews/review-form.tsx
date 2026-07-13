import { useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { createReviewAction } from "@/app/actions/review.actions";
import { StarRatingInput } from "@/components/reviews/star-rating-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StatusAlert } from "@/components/ui/status-alert";
import { LIMITS } from "@/lib/constants";
import { getPublicProfileUrl } from "@/lib/profile/public-url";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const RELATIONSHIP_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "Client", label: "Client" },
  { value: "Student", label: "Student" },
  { value: "Parent", label: "Parent" },
  { value: "Colleague", label: "Colleague" },
  { value: "Friend", label: "Friend" },
  { value: "Other", label: "Other" },
] as const;

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
  title: string;
  body: string;
  wouldRecommend: boolean;
  relationship: string;
};

const initialState: FormState = {
  reviewerName: "",
  reviewerEmail: "",
  rating: 0,
  title: "",
  body: "",
  wouldRecommend: true,
  relationship: "",
};

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
      setFieldErrors({ rating: ["Please select a star rating"] });
      return;
    }

    startTransition(async () => {
      const result = await createReviewAction({
        ...(requestToken ? { requestToken } : { slug }),
        reviewerName: form.reviewerName,
        reviewerEmail: form.reviewerEmail,
        rating: form.rating,
        title: form.title,
        body: form.body,
        wouldRecommend: form.wouldRecommend,
        relationship: form.relationship || null,
      });

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setFormError(result.message);
        return;
      }

      toast.success("Thank you! Your review has been submitted.");
      navigate(getPublicProfileUrl(slug));
    });
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)} noValidate>
      {formError ? (
        <StatusAlert status="error" title="Unable to submit review" description={formError} />
      ) : null}

      <div className="space-y-2">
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

      <div className="space-y-2">
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
        <p className="text-xs text-muted-foreground">
          {lockEmail
            ? "This email is tied to your review invitation and cannot be changed."
            : "Used only to prevent duplicate reviews. Not shown publicly."}
        </p>
        {fieldError("reviewerEmail") ? (
          <p className="text-sm text-destructive">{fieldError("reviewerEmail")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Overall rating for {displayName}</Label>
        <StarRatingInput
          value={form.rating}
          onChange={(value) => updateField("rating", value)}
          disabled={isPending}
          error={fieldError("rating")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Review title</Label>
        <Input
          id="title"
          name="title"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          maxLength={LIMITS.REVIEW_TITLE_MAX_LENGTH}
          aria-invalid={Boolean(fieldError("title"))}
          disabled={isPending}
          required
        />
        {fieldError("title") ? (
          <p className="text-sm text-destructive">{fieldError("title")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Review</Label>
        <Textarea
          id="body"
          name="body"
          rows={5}
          value={form.body}
          onChange={(event) => updateField("body", event.target.value)}
          maxLength={LIMITS.REVIEW_TEXT_MAX_LENGTH}
          aria-invalid={Boolean(fieldError("body"))}
          disabled={isPending}
          required
        />
        <p className="text-xs text-muted-foreground">
          Minimum {LIMITS.REVIEW_BODY_MIN_LENGTH} characters
        </p>
        {fieldError("body") ? (
          <p className="text-sm text-destructive">{fieldError("body")}</p>
        ) : null}
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Would you recommend {displayName}?</legend>
        <RadioGroup
          value={form.wouldRecommend ? "yes" : "no"}
          onValueChange={(value) => updateField("wouldRecommend", value === "yes")}
          className="flex flex-col gap-3 sm:flex-row sm:gap-6"
          disabled={isPending}
        >
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="yes" />
            Yes
          </label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="no" />
            No
          </label>
        </RadioGroup>
        {fieldError("wouldRecommend") ? (
          <p className="text-sm text-destructive">{fieldError("wouldRecommend")}</p>
        ) : null}
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="relationship">Your relationship (optional)</Label>
        <select
          id="relationship"
          name="relationship"
          value={form.relationship}
          onChange={(event) => updateField("relationship", event.target.value)}
          disabled={isPending}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {RELATIONSHIP_OPTIONS.map((option) => (
            <option key={option.value || "none"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldError("relationship") ? (
          <p className="text-sm text-destructive">{fieldError("relationship")}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
        {isPending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
