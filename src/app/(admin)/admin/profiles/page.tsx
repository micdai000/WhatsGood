import { Link, useSearchParams } from "react-router-dom";
import {
  AdminDeleteProfileButton,
  AdminEmptyState,
  AdminPagination,
  AdminSearchForm,
} from "@/components/admin";
import { Muted, Paragraph } from "@/components/typography/typography";
import { Spinner } from "@/components/ui/spinner";
import { useServiceQuery } from "@/hooks/use-service-query";
import { adminService } from "@/services/admin";
import { formatDate } from "@/lib/utils/format-date";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminProfilesPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") ?? undefined;
  const pageParam = searchParams.get("page");
  const page = Number(pageParam ?? 1);

  const result = useServiceQuery(
    () =>
      adminService.getProfiles({
        query,
        page: Number.isFinite(page) ? page : 1,
        limit: 20,
      }),
    [query, pageParam],
  );

  if (result.status === "loading") {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (result.status === "error") {
    return <Paragraph className="text-destructive">{result.message}</Paragraph>;
  }

  const { items, ...pagination } = result.data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Profiles</h2>
        <Muted className="text-sm">Search and moderate professional profiles.</Muted>
      </div>

      <AdminSearchForm placeholder="Search by name, username, or location…" />

      {items.length === 0 ? (
        <AdminEmptyState
          title="No profiles found"
          description="Try a different search term."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium" scope="col">
                  Professional
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Location
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Created
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((profile) => (
                <tr key={profile.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Paragraph className="font-medium">{profile.displayName}</Paragraph>
                    <Muted className="text-xs">@{profile.username}</Muted>
                  </td>
                  <td className="px-4 py-3">
                    {profile.city && profile.state
                      ? `${profile.city}, ${profile.state}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatDate(profile.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/u/${profile.username}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </Link>
                      <AdminDeleteProfileButton
                        profileId={profile.id}
                        displayName={profile.displayName}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminPagination
        result={{ ...pagination, items }}
        basePath="/admin/profiles"
        params={{ query }}
      />
    </div>
  );
}
