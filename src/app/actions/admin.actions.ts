import { adminService } from "@/services/admin";
import { ValidationError } from "@/lib/errors";
import type {
  AdminListParams,
  CreateProfessionInput,
  UpdateProfessionInput,
} from "@/types";
import { isFailure } from "@/types";

export type AdminActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; message: string; code: string };

function toAdminActionError(error: {
  message: string;
  code: string;
}): AdminActionResult<never> {
  return {
    success: false,
    message: error.message,
    code: error.code,
  };
}

export async function adminDeleteReviewAction(
  reviewId: string,
): Promise<AdminActionResult> {
  const result = await adminService.deleteReview(reviewId);

  if (isFailure(result)) {
    return toAdminActionError(result.error);
  }

  return { success: true, data: undefined };
}

export async function adminDeleteProfileAction(
  profileId: string,
): Promise<AdminActionResult> {
  const result = await adminService.deleteProfile(profileId);

  if (isFailure(result)) {
    return toAdminActionError(result.error);
  }


  return { success: true, data: undefined };
}

export async function adminCreateProfessionAction(
  input: CreateProfessionInput,
): Promise<AdminActionResult<{ id: string }>> {
  try {
    const result = await adminService.createProfession(input);

    if (isFailure(result)) {
      return toAdminActionError(result.error);
    }
    return { success: true, data: { id: result.data.id } };
  } catch (error) {
    if (error instanceof ValidationError) {
      return toAdminActionError({ message: error.message, code: error.code });
    }
    return {
      success: false,
      message: "An unexpected error occurred.",
      code: "INTERNAL_ERROR",
    };
  }
}

export async function adminUpdateProfessionAction(
  id: string,
  input: UpdateProfessionInput,
): Promise<AdminActionResult> {
  try {
    const result = await adminService.updateProfession(id, input);

    if (isFailure(result)) {
      return toAdminActionError(result.error);
    }
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ValidationError) {
      return toAdminActionError({ message: error.message, code: error.code });
    }
    return {
      success: false,
      message: "An unexpected error occurred.",
      code: "INTERNAL_ERROR",
    };
  }
}

export async function adminListUsersAction(params?: AdminListParams) {
  return adminService.getUsers(params);
}

export async function adminListProfilesAction(params?: AdminListParams) {
  return adminService.getProfiles(params);
}

export async function adminListReviewsAction(params?: AdminListParams) {
  return adminService.getReviews(params);
}
