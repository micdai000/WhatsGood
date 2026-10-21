import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AdminEmptyState,
  AdminPagination,
  AdminSearchForm,
} from "@/components/admin";
import { ListingFormDialog } from "@/components/admin/listing-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Muted, Paragraph } from "@/components/typography/typography";
import { Spinner } from "@/components/ui/spinner";
import { useServiceQuery } from "@/hooks/use-service-query";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format-date";
import {
  adminBusinessService,
  type AdminListing,
  type AdminListingFilter,
} from "@/services/admin";
import { isFailure } from "@/types";

const FILTERS: Array<{ value: AdminListingFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "unverified", label: "Needs review" },
  { value: "unclaimed", label: "Unclaimed" },
  { value: "suspended", label: "Suspended" },
];

function asFilter(value: string | null): AdminListingFilter {
  return FILTERS.some((filter) => filter.value === value)
    ? (value as AdminListingFilter)
    : "all";
}

export default function AdminBusinessesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") ?? undefined;
  const filter = asFilter(searchParams.get("filter"));
  const pageParam = searchParams.get("page");
  const page = Number(pageParam ?? 1);
  const [version, setVersion] = useState(0);
  const refresh = () => setVersion((value) => value + 1);

  const result = useServiceQuery(
    () =>
      adminBusinessService.listListings({
        query,
        filter,
        page: Number.isFinite(page) ? page : 1,
        limit: 20,
      }),
    [query, filter, pageParam, version],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Businesses</h2>
          <Muted className="text-sm">
            Seed listings so customers can find businesses before owners join.
            Listings you add stay unclaimed until an owner verifies a claim.
          </Muted>
        </div>
        <ListingFormDialog onSaved={refresh} />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              if (option.value === "all") params.delete("filter");
              else params.set("filter", option.value);
              params.delete("page");
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

      <AdminSearchForm placeholder="Search by business name…" />

      {result.status === "loading" ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : result.status === "error" ? (
        <Paragraph className="text-destructive">{result.message}</Paragraph>
      ) : result.data.items.length === 0 ? (
        <AdminEmptyState
          title="No businesses found"
          description="Try a different filter, or add the first listing."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 font-medium" scope="col">Business</th>
                  <th className="px-4 py-3 font-medium" scope="col">Source</th>
                  <th className="px-4 py-3 font-medium" scope="col">State</th>
                  <th className="px-4 py-3 font-medium" scope="col">Added</th>
                  <th className="px-4 py-3 font-medium" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {result.data.items.map((listing) => (
                  <ListingRow key={listing.business.id} listing={listing} onChanged={refresh} />
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination
            result={result.data}
            basePath="/admin/businesses"
            params={{ query, filter: filter === "all" ? undefined : filter }}
          />
        </>
      )}
    </div>
  );
}

function ListingRow({
  listing,
  onChanged,
}: {
  listing: AdminListing;
  onChanged: () => void;
}) {
  const { business } = listing;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    setBusy(true);
    setError(null);
    const outcome = await action();
    setBusy(false);
    if (!outcome.ok) {
      setError(outcome.message ?? "Action failed");
      return;
    }
    onChanged();
  }

  const toggleVerified = () =>
    run(async () => {
      const result = await adminBusinessService.setVerified(business.id, !business.isVerified);
      return isFailure(result) ? { ok: false, message: result.error.message } : { ok: true };
    });

  const toggleSuspended = () =>
    run(async () => {
      const result = await adminBusinessService.setStatus(
        business.id,
        business.status === "suspended" ? "active" : "suspended",
      );
      return isFailure(result) ? { ok: false, message: result.error.message } : { ok: true };
    });

  return (
    <tr className="border-b align-top last:border-0">
      <td className="px-4 py-3">
        <Link
          to={`/b/${business.slug}`}
          className="font-medium hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {business.name}
        </Link>
        <Muted className="text-xs">
          {[listing.city, listing.state].filter(Boolean).join(", ") || "No location"}
          {" · "}
          {business.totalFeedback} feedback
        </Muted>
        {error ? (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </td>
      <td className="px-4 py-3">
        <Muted>{business.listingSource === "admin" ? "Admin seeded" : "Owner created"}</Muted>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          <Badge variant={business.isClaimed ? "secondary" : "outline"}>
            {business.isClaimed ? "Claimed" : "Unclaimed"}
          </Badge>
          <Badge variant={business.isVerified ? "default" : "outline"}>
            {business.isVerified ? "Verified" : "Unverified"}
          </Badge>
          {business.status !== "active" ? (
            <Badge variant="destructive" className="capitalize">
              {business.status}
            </Badge>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-3 tabular-nums">{formatDate(business.createdAt)}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <ListingFormDialog businessId={business.id} onSaved={onChanged} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void toggleVerified()}
          >
            {business.isVerified ? "Unverify" : "Verify"}
          </Button>
          <Button
            type="button"
            variant={business.status === "suspended" ? "outline" : "ghost"}
            size="sm"
            disabled={busy}
            onClick={() => void toggleSuspended()}
          >
            {business.status === "suspended" ? "Reactivate" : "Suspend"}
          </Button>
        </div>
      </td>
    </tr>
  );
}
