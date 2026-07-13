import { createClient } from "@/lib/supabase/client";
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
  profileSearchSchema,
  profileSlugSchema,
  updateProfileSchema,
  validate,
} from "@/lib/validators";
import { extractAvatarStoragePath } from "@/lib/profile/avatar-storage";
import { failure, handleServiceError, success } from "@/services/shared";
import type {
  CreateProfileInput,
  PaginatedResult,
  Profile,
  ProfileSearchParams,
  PublicProfile,
  ServiceResult,
  UpdateProfileInput,
} from "@/types";
import { isFailure, isSuccess } from "@/types";
import { mapProfileRow, type ProfileRow } from "./profile.mapper";
import {
  applyProfileSearchFilters,
  applyProfileSort,
  PUBLIC_PROFILE_SELECT,
} from "./profile-search.query";
import {
  mapPublicProfileRow,
  type PublicProfileRow,
} from "./public-profile.mapper";

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
      const supabase = createClient();

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .maybeSingle();

      if (error) {
        logger.error(method, error, { id: profileId });
        return failure(DatabaseError.fromSource(error));
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
      const supabase = createClient();

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) {
        logger.error(method, error, { slug: username });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("Profile"));
      }

      return success(mapProfileRow(data as ProfileRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getPublicProfile(slug: string): Promise<ServiceResult<PublicProfile>> {
    const method = "ProfileService.getPublicProfile";

    try {
      const { slug: username } = validate(profileSlugSchema, { slug });
      const supabase = createClient();

      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          username,
          display_name,
          avatar,
          bio,
          city,
          state,
          created_at,
          profession_id,
          average_rating,
          total_reviews,
          current_badge_tier,
          current_badge_period,
          professions ( name )
        `,
        )
        .eq("username", username)
        .maybeSingle();

      if (error) {
        logger.error(method, error, { slug: username });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("Profile"));
      }

      return success(mapPublicProfileRow(data as PublicProfileRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async listProfiles(
    params?: ProfileSearchParams,
  ): Promise<ServiceResult<PaginatedResult<Profile>>> {
    const method = "ProfileService.listProfiles";

    try {
      const validated = validate(profileSearchSchema, {
        ...params,
        completeOnly: params?.completeOnly ?? false,
      });
      const page = validated.page;
      const limit = validated.limit;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const supabase = createClient();
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" });

      query = applyProfileSearchFilters(query, validated);
      query = applyProfileSort(query, validated.sort);
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        logger.error(method, error, { params: validated });
        return failure(DatabaseError.fromSource(error));
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

  async searchProfiles(
    params?: ProfileSearchParams,
  ): Promise<ServiceResult<PaginatedResult<PublicProfile>>> {
    const method = "ProfileService.searchProfiles";

    try {
      const validated = validate(profileSearchSchema, params ?? {});
      const page = validated.page;
      const limit = validated.limit;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const supabase = createClient();
      let query = supabase
        .from("profiles")
        .select(PUBLIC_PROFILE_SELECT, { count: "exact" });

      query = applyProfileSearchFilters(query, validated);
      query = applyProfileSort(query, validated.sort);
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        logger.error(method, error, { params: validated });
        return failure(DatabaseError.fromSource(error));
      }

      const total = count ?? 0;
      const items = (data ?? []).map((row) =>
        mapPublicProfileRow(row as PublicProfileRow),
      );

      logger.info(method, {
        total,
        page,
        query: validated.query,
        professionId: validated.professionId,
      });

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
      const supabase = createClient();

      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (error) {
        logger.error(method, error, { slug: username });
        return failure(DatabaseError.fromSource(error));
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

      const supabase = createClient();
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(AVATARS_BUCKET)
        .upload(path, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        logger.error(method, uploadError, { userId, path });
        return failure(DatabaseError.fromSource(uploadError));
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

      const supabase = createClient();
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

        return failure(DatabaseError.fromSource(error));
      }

      logger.info(method, { userId, username: validated.slug });
      return success(mapProfileRow(data as ProfileRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async deleteAvatarByUrl(url: string): Promise<ServiceResult<void>> {
    const method = "ProfileService.deleteAvatarByUrl";

    try {
      const path = extractAvatarStoragePath(url);
      if (!path) {
        return success(undefined);
      }

      const supabase = createClient();
      const { error } = await supabase.storage.from(AVATARS_BUCKET).remove([path]);

      if (error) {
        logger.warn(method, { path, message: error.message });
      }

      return success(undefined);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async deleteUserAvatars(userId: string): Promise<ServiceResult<void>> {
    const method = "ProfileService.deleteUserAvatars";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(new AuthorizationError("You must be signed in"));
      }

      if (sessionResult.data.user.id !== userId) {
        return failure(new AuthorizationError("You can only delete your own photos"));
      }

      const supabase = createClient();
      const { data: files, error: listError } = await supabase.storage
        .from(AVATARS_BUCKET)
        .list(userId);

      if (listError) {
        logger.warn(method, { userId, message: listError.message });
        return success(undefined);
      }

      if (!files?.length) {
        return success(undefined);
      }

      const paths = files.map((file) => `${userId}/${file.name}`);
      const { error: removeError } = await supabase.storage
        .from(AVATARS_BUCKET)
        .remove(paths);

      if (removeError) {
        logger.warn(method, { userId, message: removeError.message });
      }

      return success(undefined);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async updateProfile(
    id: string,
    input: UpdateProfileInput,
  ): Promise<ServiceResult<Profile>> {
    const method = "ProfileService.updateProfile";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(new AuthorizationError("You must be signed in to update your profile"));
      }

      if (sessionResult.data.user.id !== id) {
        return failure(new AuthorizationError("You can only update your own profile"));
      }

      const { id: profileId } = validate(profileIdSchema, { id });
      const validated = validate(updateProfileSchema, input);

      if (Object.keys(validated).length === 0) {
        return failure(new ValidationError("No profile fields to update"));
      }

      const existingResult = await this.getProfile(profileId);

      if (isFailure(existingResult)) {
        return failure(existingResult.error);
      }

      const existing = existingResult.data;

      if (validated.slug && validated.slug !== existing.username) {
        const availability = await this.checkSlugAvailability(
          validated.slug,
          profileId,
        );

        if (isFailure(availability)) {
          return failure(availability.error);
        }

        if (!availability.data.available) {
          return failure(new ConflictError("This username is already taken"));
        }
      }

      const updates: Record<string, unknown> = {};

      if (validated.slug !== undefined) {
        updates.username = validated.slug;
      }
      if (validated.fullName !== undefined) {
        updates.display_name = validated.fullName;
      }
      if (validated.professionId !== undefined) {
        updates.profession_id = validated.professionId;
      }
      if (validated.bio !== undefined) {
        updates.bio = validated.bio?.trim() ? validated.bio.trim() : null;
      }
      if (validated.city !== undefined) {
        updates.city = validated.city;
      }
      if (validated.state !== undefined) {
        updates.state = validated.state;
      }
      if (validated.profilePhoto !== undefined) {
        updates.avatar = validated.profilePhoto;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profileId)
        .select("*")
        .single();

      if (error) {
        logger.error(method, error, { profileId });

        if (error.code === "23505") {
          return failure(new ConflictError("This username is already taken"));
        }

        return failure(DatabaseError.fromSource(error));
      }

      if (
        validated.profilePhoto !== undefined &&
        existing.avatar &&
        validated.profilePhoto !== existing.avatar
      ) {
        await this.deleteAvatarByUrl(existing.avatar);
      }

      logger.info(method, {
        profileId,
        updatedFields: Object.keys(validated),
        usernameChanged: validated.slug !== undefined && validated.slug !== existing.username,
      });

      return success(mapProfileRow(data as ProfileRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async deleteProfile(id: string): Promise<ServiceResult<void>> {
    const method = "ProfileService.deleteProfile";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(new AuthorizationError("You must be signed in"));
      }

      if (sessionResult.data.user.id !== id) {
        return failure(new AuthorizationError("You can only delete your own profile"));
      }

      const { id: profileId } = validate(profileIdSchema, { id });
      const existingResult = await this.getProfile(profileId);

      if (isFailure(existingResult)) {
        return failure(existingResult.error);
      }

      await this.deleteUserAvatars(profileId);

      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profileId);

      if (error) {
        logger.error(method, error, { profileId });
        return failure(DatabaseError.fromSource(error));
      }

      logger.info(method, { profileId });
      return success(undefined);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }
}

export const profileService = new ProfileService();
