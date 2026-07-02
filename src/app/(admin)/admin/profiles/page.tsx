import Link from "next/link";
import { Suspense } from "react";
import {
  AdminDeleteProfileButton,
  AdminEmptyState,
  AdminPagination,
  AdminSearchForm,
} from "@/components/admin";
import { Muted, Paragraph } from "@/components/typography/typography";
import { adminService } from "@/services/admin";
import { formatDate } from "@/lib/utils/format-date";
import { isFailure } from "@/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface AdminProfilesPageProps {
  searchParams: Promise<{ query?: string; page?: string }>;
}

export default async function AdminProfilesPage({
  searchParams,
}: AdminProfilesPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const result = await adminService.getProfiles({
    query: params.query,
    page: Number.isFinite(page) ? page : 1,
    limit: 20,
  });

  if (isFailure(result)) {
    return <Paragraph className="text-destructive">{result.error.message}</Paragraph>;
  }

  const { items, ...pagination } = result.data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Profiles</h2>
        <Muted className="text-sm">Search and moderate professional profiles.</Muted>
      </div>

      <Suspense>
        <AdminSearchForm placeholder="Search by name, username, or location…" />
      </Suspense>

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
                        href={`/u/${profile.username}`}
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
        params={{ query: params.query }}
      />
    </div>
  );
}
