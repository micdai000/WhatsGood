"use client";

import Link from "next/link";
import { useTransition } from "react";
import { buttonVariants } from "@/components/ui/button";
import { buildSearchUrl } from "@/lib/search/params";
import type { PaginatedResult, ProfileSearchParams } from "@/types";
import { cn } from "@/lib/utils";

interface SearchPaginationProps {
  result: PaginatedResult<unknown>;
  params: ProfileSearchParams;
  className?: string;
}

export function SearchPagination({
  result,
  params,
  className,
}: SearchPaginationProps) {
  const [isPending, startTransition] = useTransition();

  if (result.totalPages <= 1) {
    return null;
  }

  const prevHref =
    result.page > 1
      ? buildSearchUrl("/search", { ...params, page: result.page - 1 })
      : null;
  const nextHref =
    result.page < result.totalPages
      ? buildSearchUrl("/search", { ...params, page: result.page + 1 })
      : null;

  return (
    <nav
      className={cn(
        "flex flex-col items-center justify-between gap-4 sm:flex-row",
        isPending && "opacity-70",
        className,
      )}
      aria-label="Search results pagination"
    >
      <p className="text-sm text-muted-foreground">
        Page {result.page} of {result.totalPages} · {result.total} professional
        {result.total === 1 ? "" : "s"}
      </p>
      <div className="flex gap-2">
        {prevHref ? (
          <Link
            href={prevHref}
            className={buttonVariants({ variant: "outline", size: "sm" })}
            onClick={() => startTransition(() => {})}
          >
            Previous
          </Link>
        ) : (
          <span
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "pointer-events-none opacity-50",
            })}
          >
            Previous
          </span>
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            className={buttonVariants({ variant: "outline", size: "sm" })}
            onClick={() => startTransition(() => {})}
          >
            Next
          </Link>
        ) : (
          <span
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "pointer-events-none opacity-50",
            })}
          >
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
