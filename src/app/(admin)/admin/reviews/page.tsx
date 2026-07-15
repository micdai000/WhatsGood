import { useSearchParams } from "react-router-dom";
import {
  AdminDeleteReviewButton,
  AdminEmptyState,
  AdminPagination,
  AdminSearchForm,
} from "@/components/admin";
import { Muted, Paragraph } from "@/components/typography/typography";
import { Spinner } from "@/components/ui/spinner";
import { useServiceQuery } from "@/hooks/use-service-query";
import { adminService } from "@/services/admin";
import { formatDate } from "@/lib/utils/format-date";
import { formatRating } from "@/lib/utils/format-rating";

export default function AdminReviewsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") ?? undefined;
  const pageParam = searchParams.get("page");
  const page = Number(pageParam ?? 1);

  const result = useServiceQuery(
    () =>
      adminService.getReviews({
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
        <h2 className="text-xl font-semibold">Reviews</h2>
        <Muted className="text-sm">
          Moderate reviews across the platform. Moderation status coming in a future phase.
        </Muted>
      </div>

      <AdminSearchForm placeholder="Search reviews by name, email, or content…" />

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
        params={{ query }}
      />
    </div>
  );
}
