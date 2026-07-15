import { Link, useSearchParams } from "react-router-dom";
import {
  AdminEmptyState,
  AdminPagination,
  AdminSearchForm,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Muted, Paragraph } from "@/components/typography/typography";
import { Spinner } from "@/components/ui/spinner";
import { useServiceQuery } from "@/hooks/use-service-query";
import { adminService } from "@/services/admin";
import { formatDate } from "@/lib/utils/format-date";

export default function AdminUsersPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") ?? undefined;
  const pageParam = searchParams.get("page");
  const page = Number(pageParam ?? 1);

  const result = useServiceQuery(
    () =>
      adminService.getUsers({
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
        <h2 className="text-xl font-semibold">Users</h2>
        <Muted className="text-sm">Search platform accounts and view roles.</Muted>
      </div>

      <AdminSearchForm placeholder="Search by email or user ID…" />

      {items.length === 0 ? (
        <AdminEmptyState
          title="No users found"
          description="Try a different search term."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium" scope="col">
                  Email
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Role
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Profile
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Joined
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Paragraph className="font-medium">{user.email}</Paragraph>
                    <Muted className="text-xs">{user.id}</Muted>
                  </td>
                  <td className="px-4 py-3">
                    {user.adminRole ? (
                      <Badge variant="secondary" className="capitalize">
                        {user.adminRole}
                      </Badge>
                    ) : (
                      <Muted>User</Muted>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.profileUsername ? (
                      <Link
                        to={`/u/${user.profileUsername}`}
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        @{user.profileUsername}
                      </Link>
                    ) : (
                      <Muted>None</Muted>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {user.adminRole === "owner" ? (
                      <Muted className="text-xs">Protected</Muted>
                    ) : (
                      <Muted className="text-xs">—</Muted>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminPagination
        result={{ ...pagination, items }}
        basePath="/admin/users"
        params={{ query }}
      />
    </div>
  );
}
