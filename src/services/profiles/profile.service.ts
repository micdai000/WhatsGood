import "server-only";

import { createClient } from "@/lib/supabase/server";
import { authService } from "@/services/auth/auth.service";
import {
  AuthorizationError,
  ConflictError,
  DatabaseError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { LIMITS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import {
  createProfileSchema,
  profileIdSchema,
  profileSlugSchema,
  validate,
} from "@/lib/validators";
import { failure, handleServiceError, notImplemented, success } from "@/services/shared";
import type {
  CreateProfileInput,
  PaginatedResult,
  PaginationParams,
  Profile,
  ServiceResult,
  UpdateProfileInput,
} from "@/types";
import { isFailure, isSuccess } from "@/types";
import { mapProfileRow, type ProfileRow } from "./profile.mapper";
import { PAGINATION } from "@/lib/constants";

const AVATARS_BUCKET = "avatars";

const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

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

  async checkSlugAvailability(
    slug: string,
    excludeUserId?: string,
  ): Promise<ServiceResult<{ available: boolean }>> {
    const method = "ProfileService.checkSlugAvailability";

    try {
      const { slug: username } = validate(profileSlugSchema, { slug });
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (error) {
        logger.error(method, error, { slug: username });
        return failure(new DatabaseError(error.message));
      }

      if (!data) {
        return success({ available: true });
      }

      if (excludeUserId && data.id === excludeUserId) {
        return success({ available: true });
      }

      return success({ available: false });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async uploadProfilePhoto(
    file: File,
  ): Promise<ServiceResult<{ url: string; path: string }>> {
    const method = "ProfileService.uploadProfilePhoto";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(new AuthorizationError("You must be signed in to upload a photo"));
      }

      const userId = sessionResult.data.user.id;

      if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
        return failure(
          new ValidationError("Photo must be a JPEG, PNG, WebP, or GIF image"),
        );
      }

      if (file.size > LIMITS.PROFILE_PHOTO_MAX_BYTES) {
        return failure(new ValidationError("Photo must be 5 MB or smaller"));
      }

      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExtension = ["jpeg", "jpg", "png", "webp", "gif"].includes(extension)
        ? extension === "jpeg"
          ? "jpg"
          : extension
        : "jpg";
      const path = `${userId}/${Date.now()}.${safeExtension}`;

      const supabase = await createClient();
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(AVATARS_BUCKET)
        .upload(path, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        logger.error(method, uploadError, { userId, path });
        return failure(new DatabaseError(uploadError.message));
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);

      return success({ url: publicUrl, path });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async createProfile(input: CreateProfileInput): Promise<ServiceResult<Profile>> {
    const method = "ProfileService.createProfile";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(new AuthorizationError("You must be signed in to create a profile"));
      }

      const userId = sessionResult.data.user.id;
      const validated = validate(createProfileSchema, input);

      const existingProfile = await this.getProfile(userId);

      if (isSuccess(existingProfile)) {
        return failure(
          new ConflictError("A profile already exists for this account"),
        );
      }

      if (
        isFailure(existingProfile) &&
        existingProfile.error.code !== "NOT_FOUND"
      ) {
        return failure(existingProfile.error);
      }

      const availability = await this.checkSlugAvailability(validated.slug, userId);

      if (isFailure(availability)) {
        return failure(availability.error);
      }

      if (!availability.data.available) {
        return failure(new ConflictError("This username is already taken"));
      }

      const supabase = await createClient();
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          username: validated.slug,
          display_name: validated.fullName,
          avatar: validated.profilePhoto ?? null,
          bio: validated.bio?.trim() ? validated.bio.trim() : null,
          profession_id: validated.professionId,
          city: validated.city,
          state: validated.state,
        })
        .select("*")
        .single();

      if (error) {
        logger.error(method, error, { userId });

        if (error.code === "23505") {
          return failure(new ConflictError("This username is already taken"));
        }

        return failure(new DatabaseError(error.message));
      }

      logger.info(method, { userId, username: validated.slug });
      return success(mapProfileRow(data as ProfileRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
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
