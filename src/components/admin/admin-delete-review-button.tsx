import { AdminConfirmDelete } from "@/components/admin/admin-confirm-delete";
import { adminDeleteReviewAction } from "@/app/actions/admin.actions";

interface AdminDeleteReviewButtonProps {
  reviewId: string;
}

export function AdminDeleteReviewButton({ reviewId }: AdminDeleteReviewButtonProps) {
  return (
    <AdminConfirmDelete
      label="Delete"
      title="Delete this review?"
      description="This permanently removes the review and updates profile statistics."
      onConfirm={async () => {
        const result = await adminDeleteReviewAction(reviewId);
        return {
          success: result.success,
          message: result.success ? undefined : result.message,
        };
      }}
    />
  );
}
