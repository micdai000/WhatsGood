import "server-only";

import { createClient } from "@/lib/supabase/server";
import { DatabaseError, NotFoundError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { profileIdSchema, profileSlugSchema, validate } from "@/lib/validators";
import { failure, handleServiceError, notImplemented, success } from "@/services/shared";
import type {
  CreateProfileInput,
  PaginatedResult,
  PaginationParams,
  Profile,
  ServiceResult,
  UpdateProfileInput,
} from "@/types";
import { mapProfileRow, type ProfileRow } from "./profile.mapper";
import { PAGINATION } from "@/lib/constants";

export class ProfileService {
  async getProfile(id: string): Promise<ServiceResult<Profile>> {
    const method = "ProfileService.getProfile";

    try {
      const { id: profileId } = validate(profileIdSchema, { id });
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .maybeSingle();

      if (error) {
        logger.error(method, error, { id: profileId });
        return failure(new DatabaseError(error.message));
      }

      if (!data) {
        return failure(new NotFoundError("Profile"));
      }

      return success(mapProfileRow(data as ProfileRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getProfileBySlug(slug: string): Promise<ServiceResult<Profile>> {
    const method = "ProfileService.getProfileBySlug";

    try {
      const { slug: username } = validate(profileSlugSchema, { slug });
      const supabase = await createClient();

      // Username column serves as the public slug until TrustLoop profile migration.
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) {
        logger.error(method, error, { slug: username });
        return failure(new DatabaseError(error.message));
      }

      if (!data) {
        return failure(new NotFoundError("Profile"));
      }

      return success(mapProfileRow(data as ProfileRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async listProfiles(
    params?: PaginationParams,
  ): Promise<ServiceResult<PaginatedResult<Profile>>> {
    const method = "ProfileService.listProfiles";

    try {
      const page = params?.page ?? PAGINATION.DEFAULT_PAGE;
      const limit = Math.min(
        params?.limit ?? PAGINATION.DEFAULT_LIMIT,
        PAGINATION.MAX_LIMIT,
      );
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const supabase = await createClient();
      const { data, error, count } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        logger.error(method, error);
        return failure(new DatabaseError(error.message));
      }

      const total = count ?? 0;
      const items = (data ?? []).map((row) => mapProfileRow(row as ProfileRow));

      return success({
        items,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async createProfile(
    _input: CreateProfileInput,
  ): Promise<ServiceResult<Profile>> {
    return notImplemented("ProfileService.createProfile");
  }

  async updateProfile(
    _id: string,
    _input: UpdateProfileInput,
  ): Promise<ServiceResult<Profile>> {
    return notImplemented("ProfileService.updateProfile");
  }

  async deleteProfile(_id: string): Promise<ServiceResult<void>> {
    return notImplemented("ProfileService.deleteProfile");
  }
}

export const profileService = new ProfileService();
