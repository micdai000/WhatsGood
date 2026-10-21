import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ClaimRequestCard } from "@/components/business-claim/claim-request-card";
import { FormField } from "@/components/business-onboarding/form-field";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { StatusAlert } from "@/components/ui/status-alert";
import { Muted, Paragraph } from "@/components/typography/typography";
import { cn } from "@/lib/utils";
import { businessService } from "@/services/businesses";
import { isFailure } from "@/types";
import type { BusinessSearchResult, ClaimRequestWithBusiness } from "@/types";

export function ClaimHubPage() {
  const [searchParams] = useSearchParams();
  const submittedId = searchParams.get("submitted");

  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<BusinessSearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [claims, setClaims] = useState<ClaimRequestWithBusiness[] | null>(null);
  const [claimsError, setClaimsError] = useState<string | null>(null);

  const loadClaims = useCallback(async () => {
    const result = await businessService.getMyClaimRequests();
    if (isFailure(result)) {
      setClaimsError(result.error.message);
      setClaims([]);
      return;
    }
    setClaimsError(null);
    setClaims(result.data);
  }, []);

  useEffect(() => {
    void loadClaims();
  }, [loadClaims]);

  useEffect(() => {
    const query = search.trim();
    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const result = await businessService.searchBusinesses(query);
      if (cancelled) return;
      setSearching(false);
      if (isFailure(result)) {
        setSearchError(result.error.message);
        return;
      }
      setSearchError(null);
      setResults(result.data);
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search]);

  return (
    <OnboardingLayout>
      <div className="space-y-8">
        {submittedId ? (
          <StatusAlert
            status="success"
            title="Claim request submitted"
            description="Next, we verify that you own the business. Follow the steps on your request below."
          />
        ) : null}

        <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Claim your business
            </h1>
            <Paragraph className="text-muted-foreground">
              Find your business on Meritt. To protect owners, we confirm every
              claim through the phone, email, or website already listed for the
              business before granting access.
            </Paragraph>
          </div>

          <FormField label="Business name" htmlFor="claim-search">
            <Input
              id="claim-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by business name"
              autoComplete="off"
            />
          </FormField>

          {searchError ? (
            <StatusAlert status="error" title="Search failed" description={searchError} />
          ) : null}

          {searching ? <Muted className="text-sm">Searching…</Muted> : null}

          {!searching && results.length > 0 ? (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {results.map((result) => (
                <li
                  key={result.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{result.name}</p>
                    <Muted className="text-sm">
                      {[
                        result.categoryName,
                        [result.city, result.state].filter(Boolean).join(", "),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Muted>
                  </div>
                  {result.isClaimed ? (
                    <Muted className="text-sm">Already claimed</Muted>
                  ) : (
                    <Link
                      to={`/claim/${result.id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      Claim this business
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          {!searching && search.trim().length >= 2 && results.length === 0 && !searchError ? (
            <div className="space-y-2 rounded-xl border border-dashed border-border p-4">
              <p className="text-sm font-medium">Not listed yet?</p>
              <Muted className="text-sm">
                You can create your business profile right away.
              </Muted>
              <Link
                to="/onboarding/business"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Create a business
              </Link>
            </div>
          ) : null}
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Your claim requests
          </h2>
          {claims === null ? (
            <Spinner className="h-5 w-5" />
          ) : claimsError ? (
            <StatusAlert status="error" title="Unable to load claims" description={claimsError} />
          ) : claims.length === 0 ? (
            <Muted className="text-sm">You haven&apos;t requested any claims yet.</Muted>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border bg-card">
              {claims.map((claim) => (
                <ClaimRequestCard
                  key={claim.id}
                  claim={claim}
                  onChanged={() => void loadClaims()}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </OnboardingLayout>
  );
}
