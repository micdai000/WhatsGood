import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AdminEmptyState } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Muted, Paragraph } from "@/components/typography/typography";
import { Spinner } from "@/components/ui/spinner";
import { StatusAlert } from "@/components/ui/status-alert";
import { useServiceQuery } from "@/hooks/use-service-query";
import {
  CLAIMANT_ROLE_LABELS,
  getClaimWebsiteToken,
  usesVerificationCode,
  VERIFICATION_METHOD_LABELS,
} from "@/lib/business/claim";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format-date";
import { adminBusinessService } from "@/services/admin";
import { isFailure } from "@/types";
import type { AdminBusinessClaim, ClaimRequestStatus } from "@/types";

type StatusFilter = ClaimRequestStatus | "all";

const FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const MAX_CODE_ATTEMPTS = 5;

function asFilter(value: string | null): StatusFilter {
  return FILTERS.some((filter) => filter.value === value)
    ? (value as StatusFilter)
    : "pending";
}

function domainOf(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.includes("@")) return value.split("@")[1]?.toLowerCase() ?? null;
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function digitsOf(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "").slice(-10);
}

export default function AdminClaimsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = asFilter(searchParams.get("status"));
  const [version, setVersion] = useState(0);
  const refresh = () => setVersion((value) => value + 1);

  const result = useServiceQuery(
    () => adminBusinessService.listClaims(filter),
    [filter, version],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Ownership claims</h2>
        <Muted className="text-sm">
          Only approve a claim after the claimant proves control of a contact
          channel on the public listing. Never send codes to contact details
          the claimant typed in.
        </Muted>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              if (option.value === "pending") params.delete("status");
              else params.set("status", option.value);
              setSearchParams(params);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              filter === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {result.status === "loading" ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : result.status === "error" ? (
        <Paragraph className="text-destructive">{result.message}</Paragraph>
      ) : result.data.length === 0 ? (
        <AdminEmptyState
          title="No claims"
          description={
            filter === "pending"
              ? "Nobody is waiting on a claim review right now."
              : "No claims match this filter."
          }
        />
      ) : (
        <ul className="space-y-4">
          {result.data.map((item) => (
            <ClaimReviewCard key={item.claim.id} item={item} onChanged={refresh} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ClaimReviewCard({
  item,
  onChanged,
}: {
  item: AdminBusinessClaim;
  onChanged: () => void;
}) {
  const { claim, business } = item;
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issuedCode, setIssuedCode] = useState<string | null>(null);

  const pending = claim.status === "pending";
  const codeMethod = usesVerificationCode(claim.verificationMethod);
  const websiteDomain = domainOf(business.websiteUrl);
  const claimantDomains = [domainOf(claim.contactEmail), domainOf(item.claimantEmail)];
  const emailMatchesWebsite =
    websiteDomain !== null && claimantDomains.includes(websiteDomain);
  const phoneMatchesListing =
    digitsOf(business.phone).length === 10 &&
    digitsOf(business.phone) === digitsOf(claim.contactPhone);

  async function issueCode() {
    setBusy(true);
    setError(null);
    const result = await adminBusinessService.issueClaimCode(claim.id);
    setBusy(false);
    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }
    setIssuedCode(result.data);
  }

  async function review(kind: "approve" | "reject") {
    if (
      kind === "approve" &&
      !window.confirm(
        `Approve ${claim.claimantName ?? "this claimant"} as owner of ${business.name}? They will get full access to the business and its feedback.`,
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    const result =
      kind === "approve"
        ? await adminBusinessService.approveClaim(claim.id, notes)
        : await adminBusinessService.rejectClaim(claim.id, notes);
    setBusy(false);
    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }
    onChanged();
  }

  return (
    <li className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to={`/b/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold hover:underline"
          >
            {business.name}
          </Link>
          <Muted className="text-sm">
            {[item.city, item.state].filter(Boolean).join(", ")} · Submitted{" "}
            {formatDate(claim.createdAt)}
          </Muted>
        </div>
        <Badge variant={claim.status === "pending" ? "secondary" : "outline"} className="capitalize">
          {claim.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1 rounded-lg border border-border bg-muted/30 p-4 text-sm">
          <p className="font-medium">Public listing (verify through these)</p>
          <p>Phone: {business.phone ?? <Muted className="inline">none</Muted>}</p>
          <p>Email: {business.email ?? <Muted className="inline">none</Muted>}</p>
          <p>
            Website:{" "}
            {business.websiteUrl ? (
              <a
                href={business.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {business.websiteUrl}
              </a>
            ) : (
              <Muted className="inline">none</Muted>
            )}
          </p>
          <Muted className="text-xs">
            {business.listingSource === "admin" ? "Admin-seeded listing" : "Owner-created listing"}
            {" · "}
            {business.totalFeedback} feedback
          </Muted>
        </div>

        <div className="space-y-1 rounded-lg border border-border p-4 text-sm">
          <p className="font-medium">Claimant</p>
          <p>
            {claim.claimantName ?? "Unknown"}
            {claim.claimantRole ? ` · ${CLAIMANT_ROLE_LABELS[claim.claimantRole]}` : ""}
          </p>
          <p>Account: {item.claimantEmail ?? "unknown"}</p>
          {claim.contactPhone ? <p>Phone: {claim.contactPhone}</p> : null}
          {claim.contactEmail ? <p>Email: {claim.contactEmail}</p> : null}
          <p>Method: {VERIFICATION_METHOD_LABELS[claim.verificationMethod]}</p>
          {claim.evidenceUrl ? (
            <p>
              Document:{" "}
              <a
                href={claim.evidenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                open link
              </a>
            </p>
          ) : null}
          {claim.claimantNote ? <Muted className="text-xs">“{claim.claimantNote}”</Muted> : null}
        </div>
      </div>

      {pending && (emailMatchesWebsite || phoneMatchesListing) ? (
        <Muted className="text-xs">
          Signals:{" "}
          {[
            phoneMatchesListing ? "claimant phone matches the listing" : null,
            emailMatchesWebsite ? "claimant email domain matches the website" : null,
          ]
            .filter(Boolean)
            .join("; ")}
          . These are hints only — still verify through the listing.
        </Muted>
      ) : null}

      {error ? <StatusAlert status="error" title="Action failed" description={error} /> : null}

      {pending && codeMethod ? (
        <div className="space-y-2 rounded-lg border border-border p-4 text-sm">
          {issuedCode ? (
            <>
              <p>
                {claim.verificationMethod === "phone"
                  ? `Call ${business.phone ?? "the listed number"}, ask for ${claim.claimantName ?? "the claimant"}, and read them this code:`
                  : `Email this code to ${business.email ?? `an address at ${websiteDomain ?? "the business domain"}`}:`}
              </p>
              <p className="font-mono text-2xl font-semibold tracking-widest">{issuedCode}</p>
              <Muted className="text-xs">
                Shown once. Expires in 24 hours. They enter it at /claim to finish.
              </Muted>
            </>
          ) : claim.codeIssuedAt ? (
            <Muted className="text-sm">
              Code issued {new Date(claim.codeIssuedAt).toLocaleString()}
              {item.codeAttempts !== null
                ? ` · ${item.codeAttempts}/${MAX_CODE_ATTEMPTS} attempts used`
                : ""}
              . Issue a new one if it expired or was lost.
            </Muted>
          ) : (
            <Muted className="text-sm">
              Issue a code, then deliver it through the listing&apos;s{" "}
              {claim.verificationMethod === "phone" ? "phone number" : "email"}.
            </Muted>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => void issueCode()}
          >
            {claim.codeIssuedAt || issuedCode ? "Issue new code" : "Issue code"}
          </Button>
        </div>
      ) : null}

      {pending && claim.verificationMethod === "website" ? (
        <div className="space-y-1 rounded-lg border border-border p-4 text-sm">
          <p>
            Look for{" "}
            <span className="font-mono font-semibold">{getClaimWebsiteToken(claim.id)}</span>{" "}
            on the listing&apos;s website or a social profile linked from it.
          </p>
        </div>
      ) : null}

      {pending ? (
        <div className="space-y-3">
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            placeholder="Notes (shown to the claimant)"
            aria-label="Review notes"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" disabled={busy} onClick={() => void review("approve")}>
              Approve claim
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void review("reject")}
            >
              Reject
            </Button>
          </div>
        </div>
      ) : claim.reviewNotes ? (
        <Muted className="text-sm">Notes: {claim.reviewNotes}</Muted>
      ) : null}
    </li>
  );
}
