import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusAlert } from "@/components/ui/status-alert";
import { Muted, Paragraph } from "@/components/typography/typography";
import { EXPERIENCE_TYPES } from "@/lib/feedback/experience-types";
import { buildSubmitFeedbackInput } from "@/lib/feedback/build-submit-input";
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
  const [step, setStep] = useState<"prompt" | "recommend" | "type" | "done">("prompt");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(experienceType: string) {
    if (wouldRecommend == null) return;
    setSubmitting(true);
    setError(null);
    const result = await feedbackService.submitFeedback(
      buildSubmitFeedbackInput({
        businessId,
        qr,
        wouldRecommend,
        experienceType,
      }),
    );
    setSubmitting(false);
    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }
    setStep("done");
  }

  if (step === "done") {
    return (
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold tracking-tight">Thanks for your feedback.</h2>
        <Paragraph className="text-muted-foreground">
          Your experience helps create a more current picture of this business.
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
    <div className="space-y-5 rounded-xl border border-border bg-card p-6">
      {error ? (
        <StatusAlert status="error" title="Unable to submit feedback" description={error} />
      ) : null}

      {step === "prompt" ? (
        <>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">
              You visited {businessName}.
            </h2>
            <Paragraph className="text-muted-foreground">How was your experience?</Paragraph>
          </div>
          <Button type="button" className="min-h-11 w-full" onClick={() => setStep("recommend")}>
            Give Feedback
          </Button>
        </>
      ) : null}

      {step === "recommend" ? (
        <>
          <h2 className="text-xl font-semibold tracking-tight">
            Would you recommend this business?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              className="min-h-11"
              onClick={() => {
                setWouldRecommend(true);
                setStep("type");
              }}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => {
                setWouldRecommend(false);
                setStep("type");
              }}
            >
              No
            </Button>
          </div>
        </>
      ) : null}

      {step === "type" ? (
        <>
          <h2 className="text-xl font-semibold tracking-tight">
            What describes you best?
          </h2>
          <Muted className="text-sm">This helps keep feedback in context.</Muted>
          <div className="grid gap-2">
            {EXPERIENCE_TYPES.map((type) => (
              <Button
                key={type}
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={submitting}
                onClick={() => void submit(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
