import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Muted } from "@/components/typography/typography";
import { StatusAlert } from "@/components/ui/status-alert";
import { storeBusinessId } from "@/lib/business/current-business-storage";
import {
  getClaimWebsiteToken,
  usesVerificationCode,
  VERIFICATION_METHOD_LABELS,
} from "@/lib/business/claim";
import { formatDate } from "@/lib/utils/format-date";
import { businessService } from "@/services/businesses";
import { isFailure } from "@/types";
import type { ClaimRequestStatus, ClaimRequestWithBusiness } from "@/types";

const STATUS_LABELS: Record<ClaimRequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Not approved",
  cancelled: "Cancelled",
};

export function ClaimRequestCard({
  claim,
  onChanged,
}: {
  claim: ClaimRequestWithBusiness;
  onChanged: () => void;
}) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pending = claim.status === "pending";
  const codeMethod = usesVerificationCode(claim.verificationMethod);
  const codeIssued =
    Boolean(claim.codeIssuedAt) &&
    (!claim.codeExpiresAt || new Date(claim.codeExpiresAt) > new Date());

  async function submitCode(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const result = await businessService.verifyClaimCode(claim.id, code);
    setBusy(false);

    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }

    if (!result.data.ok) {
      const remaining = result.data.attemptsRemaining;
      setError(
        remaining !== undefined && remaining > 0
          ? `${result.data.error}. ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
          : result.data.error,
      );
      return;
    }

    storeBusinessId(claim.businessId);
    navigate("/dashboard", { replace: true });
  }

  async function cancel() {
    setError(null);
    setBusy(true);
    const result = await businessService.cancelClaimRequest(claim.id);
    setBusy(false);

    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }

    onChanged();
  }

  return (
    <li className="space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          {claim.businessSlug ? (
            <Link
              to={`/b/${claim.businessSlug}`}
              className="font-semibold hover:underline"
            >
              {claim.businessName}
            </Link>
          ) : (
            <p className="font-semibold">{claim.businessName}</p>
          )}
          <Muted className="text-sm">
            {VERIFICATION_METHOD_LABELS[claim.verificationMethod]} · Submitted{" "}
            {formatDate(claim.createdAt)}
          </Muted>
        </div>
        <Badge variant={claim.status === "approved" ? "default" : "secondary"}>
          {STATUS_LABELS[claim.status]}
        </Badge>
      </div>

      {error ? (
        <StatusAlert status="error" title="Something went wrong" description={error} />
      ) : null}

      {pending && codeMethod && !codeIssued ? (
        <Muted className="text-sm">
          We&apos;ll contact the business at the{" "}
          {claim.verificationMethod === "phone" ? "phone number" : "email"} on
          its public listing with a 6-digit code, usually within 1–2 business
          days. Enter it here when you get it.
        </Muted>
      ) : null}

      {pending && codeMethod && codeIssued ? (
        <form onSubmit={submitCode} className="space-y-2">
          <label htmlFor={`code-${claim.id}`} className="text-sm font-medium">
            Enter your 6-digit verification code
          </label>
          <div className="flex gap-2">
            <Input
              id={`code-${claim.id}`}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              className="max-w-40 tracking-widest"
            />
            <Button type="submit" disabled={busy || code.length !== 6}>
              {busy ? "Checking…" : "Verify"}
            </Button>
          </div>
          {claim.codeExpiresAt ? (
            <Muted className="text-xs">
              Code expires {new Date(claim.codeExpiresAt).toLocaleString()}.
            </Muted>
          ) : null}
        </form>
      ) : null}

      {pending && claim.verificationMethod === "website" ? (
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
          <p>
            Add this code to your website or to a social profile linked from
            your listing (for example, your Instagram bio):
          </p>
          <p className="font-mono text-base font-semibold">
            {getClaimWebsiteToken(claim.id)}
          </p>
          <Muted className="text-xs">
            We&apos;ll check it and approve your claim. You can remove it
            afterward.
          </Muted>
        </div>
      ) : null}

      {pending && claim.verificationMethod === "document" ? (
        <Muted className="text-sm">
          We&apos;re reviewing your document. We may reach out if we need
          anything else.
        </Muted>
      ) : null}

      {claim.status === "approved" ? (
        <Button
          type="button"
          size="sm"
          onClick={() => {
            storeBusinessId(claim.businessId);
            navigate("/dashboard");
          }}
        >
          Go to dashboard
        </Button>
      ) : null}

      {claim.status === "rejected" && claim.reviewNotes ? (
        <Muted className="text-sm">{claim.reviewNotes}</Muted>
      ) : null}

      {pending ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => void cancel()}
        >
          Cancel request
        </Button>
      ) : null}
    </li>
  );
}
