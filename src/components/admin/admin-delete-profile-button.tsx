import { AdminConfirmDelete } from "@/components/admin/admin-confirm-delete";
import { adminDeleteProfileAction } from "@/app/actions/admin.actions";
import { DELETE_PROFILE_DATA_SUMMARY } from "@/lib/copy/vocabulary";

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
      description={DELETE_PROFILE_DATA_SUMMARY(displayName)}
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
