import { AdminConfirmDelete } from "@/components/admin/admin-confirm-delete";
import { adminDeleteProfileAction } from "@/app/actions/admin.actions";

interface AdminDeleteProfileButtonProps {
  profileId: string;
  displayName: string;
}

export function AdminDeleteProfileButton({
  profileId,
  displayName,
}: AdminDeleteProfileButtonProps) {
  return (
    <AdminConfirmDelete
      label="Delete"
      title="Delete this profile?"
      description={`This permanently removes ${displayName}'s profile, reviews, and review requests.`}
      onConfirm={async () => {
        const result = await adminDeleteProfileAction(profileId);
        return {
          success: result.success,
          message: result.success ? undefined : result.message,
        };
      }}
    />
  );
}
