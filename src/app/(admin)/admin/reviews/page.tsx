import { Suspense } from "react";
import {
  AdminDeleteReviewButton,
  AdminEmptyState,
  AdminPagination,
  AdminSearchForm,
} from "@/components/admin";
import { Muted, Paragraph } from "@/components/typography/typography";
import { adminService } from "@/services/admin";
import { formatDate } from "@/lib/utils/format-date";
import { formatRating } from "@/lib/utils/format-rating";
import { isFailure } from "@/types";

export const dynamic = "force-dynamic";

interface AdminReviewsPageProps {
  searchParams: Promise<{ query?: string; page?: string }>;
}

export default async function AdminReviewsPage({
  searchParams,
}: AdminReviewsPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const result = await adminService.getReviews({
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
        <h2 className="text-xl font-semibold">Reviews</h2>
        <Muted className="text-sm">
          Moderate reviews across the platform. Moderation status coming in a future phase.
        </Muted>
      </div>

      <Suspense>
        <AdminSearchForm placeholder="Search reviews by name, email, or content…" />
      </Suspense>

      {items.length === 0 ? (
        <AdminEmptyState
          title="No reviews found"
          description="Try a different search term."
        />
      ) : (
        <div className="space-y-4">
          {items.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border p-4"
              aria-label={`Review by ${review.reviewerName}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <Paragraph className="font-medium">{review.title}</Paragraph>
                  <Muted className="text-sm">
                    {review.reviewerName} · {formatRating(review.rating)} ·{" "}
                    {formatDate(review.createdAt)}
                  </Muted>
                  <Muted className="line-clamp-2 text-sm">{review.body}</Muted>
                </div>
                <AdminDeleteReviewButton reviewId={review.id} />
              </div>
            </article>
          ))}
        </div>
      )}

      <AdminPagination
        result={{ ...pagination, items }}
        basePath="/admin/reviews"
        params={{ query: params.query }}
      />
    </div>
  );
}
