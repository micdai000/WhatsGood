import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Muted } from "@/components/typography/typography";
import type { PaginatedResult } from "@/types";
import { cn } from "@/lib/utils";

interface AdminPaginationProps {
  result: PaginatedResult<unknown>;
  basePath: string;
  params?: Record<string, string | undefined>;
}

function buildPageUrl(
  basePath: string,
  page: number,
  params?: Record<string, string | undefined>,
) {
  const search = new URLSearchParams();
  if (params?.query) search.set("query", params.query);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function AdminPagination({
  result,
  basePath,
  params,
}: AdminPaginationProps) {
  if (result.totalPages <= 1) {
    return (
      <Muted className="text-sm">
        {result.total} result{result.total === 1 ? "" : "s"}
      </Muted>
    );
  }

  const prevPage = result.page > 1 ? result.page - 1 : null;
  const nextPage = result.page < result.totalPages ? result.page + 1 : null;

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3"
      aria-label="Pagination"
    >
      <Muted className="text-sm">
        Page {result.page} of {result.totalPages} · {result.total} total
      </Muted>
      <div className="flex gap-2">
        {prevPage ? (
          <Link
            to={buildPageUrl(basePath, prevPage, params)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Previous
          </Link>
        ) : null}
        {nextPage ? (
          <Link
            to={buildPageUrl(basePath, nextPage, params)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
