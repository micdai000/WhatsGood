import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/authorization";
import {
  AuthorizationError,
  ConflictError,
  DatabaseError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { PAGINATION, DEFAULTS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import {
  adminCreateProfessionSchema,
  adminListParamsSchema,
  adminProfessionIdSchema,
  adminProfileIdSchema,
  adminReviewIdSchema,
  adminUpdateProfessionSchema,
  validate,
} from "@/lib/validators";
import { profileService } from "@/services/profiles/profile.service";
import { mapProfileRow, type ProfileRow } from "@/services/profiles/profile.mapper";
import { mapProfessionRow, type ProfessionRow } from "@/services/professions/profession.mapper";
import { mapReviewRow, type ReviewRow } from "@/services/reviews/review.mapper";
import { failure, handleServiceError, success } from "@/services/shared";
import type {
  AdminActivityItem,
  AdminDashboardData,
  AdminDashboardStats,
  AdminListParams,
  AdminPlatformUser,
  CreateProfessionInput,
  PaginatedResult,
  Profession,
  Profile,
  Review,
  ServiceResult,
  UpdateProfessionInput,
} from "@/types";
import { isFailure, isSuccess } from "@/types";
import { writeAuditLog } from "./admin.audit";
import { escapeIlikePattern } from "@/services/profiles/profile-search.query";

type AdminUserListRow = {
  id: string;
  email: string;
  created_at: string;
  admin_role: string | null;
};

export class AdminService {
  private async assertAdmin() {
    return requireAdmin();
  }

  async getDashboard(): Promise<ServiceResult<AdminDashboardData>> {
    const method = "AdminService.getDashboard";

    try {
      const adminResult = await this.assertAdmin();
      if (!isSuccess(adminResult)) {
        return failure(adminResult.error);
      }

      const supabase = await createClient();

      const [
        usersCountResult,
        profilesCountResult,
        reviewsCountResult,
        pendingRequestsResult,
        avgRatingResult,
        recentReviewsResult,
        recentProfilesResult,
        recentRequestsResult,
        recentAuditResult,
      ] = await Promise.all([
        supabase.rpc("admin_count_users", { p_query: null }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase
          .from("review_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase.from("profiles").select("average_rating"),
        supabase
          .from("reviews")
          .select("id, reviewer_name, title, rating, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("profiles")
          .select("id, display_name, username, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("review_requests")
          .select("id, email, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("audit_logs")
          .select("id, action, entity_type, entity_id, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      if (usersCountResult.error) {
        return failure(new DatabaseError(usersCountResult.error.message));
      }

      const ratings = (avgRatingResult.data ?? []) as { average_rating: number | string }[];
      const averagePlatformRating =
        ratings.length > 0
          ? ratings.reduce((sum, row) => sum + Number(row.average_rating ?? 0), 0) /
            ratings.length
          : DEFAULTS.AVERAGE_RATING;

      const statistics: AdminDashboardStats = {
        totalUsers: Number(usersCountResult.data ?? 0),
        totalProfiles: profilesCountResult.count ?? 0,
        totalReviews: reviewsCountResult.count ?? 0,
        pendingReviewRequests: pendingRequestsResult.count ?? 0,
        averagePlatformRating: Math.round(averagePlatformRating * 100) / 100,
      };

      const recentActivity: AdminActivityItem[] = [];

      for (const review of recentReviewsResult.data ?? []) {
        recentActivity.push({
          id: `review-${review.id}`,
          type: "review",
          title: "New review",
          description: `${review.reviewer_name} left a ${review.rating}-star review`,
          timestamp: review.created_at,
        });
      }

      for (const profile of recentProfilesResult.data ?? []) {
        recentActivity.push({
          id: `profile-${profile.id}`,
          type: "profile",
          title: "New profile",
          description: `${profile.display_name} (@${profile.username}) joined`,
          timestamp: profile.created_at,
        });
      }

      for (const request of recentRequestsResult.data ?? []) {
        recentActivity.push({
          id: `request-${request.id}`,
          type: "review_request",
          title: "Review request",
          description: `Request to ${request.email} (${request.status})`,
          timestamp: request.created_at,
        });
      }

      for (const log of recentAuditResult.data ?? []) {
        recentActivity.push({
          id: `audit-${log.id}`,
          type: "audit",
          title: log.action,
          description: `${log.entity_type}${log.entity_id ? ` · ${log.entity_id}` : ""}`,
          timestamp: log.created_at,
        });
      }

      recentActivity.sort(
        (left, right) =>
          new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
      );

      logger.info(method, { adminId: adminResult.data.userId, statistics });

      return success({
        statistics,
        recentActivity: recentActivity.slice(0, 10),
      });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getUsers(
    params?: AdminListParams,
  ): Promise<ServiceResult<PaginatedResult<AdminPlatformUser>>> {
    const method = "AdminService.getUsers";

    try {
      const adminResult = await this.assertAdmin();
      if (!isSuccess(adminResult)) {
        return failure(adminResult.error);
      }

      const validated = validate(adminListParamsSchema, params ?? {});
      const page = validated.page;
      const limit = validated.limit;
      const offset = (page - 1) * limit;

      const supabase = await createClient();

      const [listResult, countResult] = await Promise.all([
        supabase.rpc("admin_list_users", {
          p_query: validated.query ?? null,
          p_limit: limit,
          p_offset: offset,
        }),
        supabase.rpc("admin_count_users", { p_query: validated.query ?? null }),
      ]);

      if (listResult.error) {
        return failure(new DatabaseError(listResult.error.message));
      }

      if (countResult.error) {
        return failure(new DatabaseError(countResult.error.message));
      }

      const rows = (listResult.data ?? []) as AdminUserListRow[];
      const userIds = rows.map((row) => row.id);

      const { data: profiles } = userIds.length
        ? await supabase
            .from("profiles")
            .select("id, username")
            .in("id", userIds)
        : { data: [] };

      const profileByUserId = new Map(
        (profiles ?? []).map((profile) => [profile.id, profile.username as string]),
      );

      const total = Number(countResult.data ?? 0);
      const items: AdminPlatformUser[] = rows.map((row) => ({
        id: row.id,
        email: row.email,
        createdAt: row.created_at,
        adminRole: row.admin_role === "owner" || row.admin_role === "admin"
          ? row.admin_role
          : null,
        hasProfile: profileByUserId.has(row.id),
        profileUsername: profileByUserId.get(row.id) ?? null,
      }));

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

  async getProfiles(
    params?: AdminListParams,
  ): Promise<ServiceResult<PaginatedResult<Profile>>> {
    const method = "AdminService.getProfiles";

    try {
      const adminResult = await this.assertAdmin();
      if (!isSuccess(adminResult)) {
        return failure(adminResult.error);
      }

      const validated = validate(adminListParamsSchema, params ?? {});
      const page = validated.page;
      const limit = validated.limit;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const supabase = await createClient();
      let query = supabase.from("profiles").select("*", { count: "exact" });

      if (validated.query) {
        const q = escapeIlikePattern(validated.query);
        query = query.or(
          `display_name.ilike.%${q}%,username.ilike.%${q}%,city.ilike.%${q}%,state.ilike.%${q}%`,
        );
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        return failure(new DatabaseError(error.message));
      }

      const total = count ?? 0;

      return success({
        items: (data ?? []).map((row) => mapProfileRow(row as ProfileRow)),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getReviews(
    params?: AdminListParams,
  ): Promise<ServiceResult<PaginatedResult<Review>>> {
    const method = "AdminService.getReviews";

    try {
      const adminResult = await this.assertAdmin();
      if (!isSuccess(adminResult)) {
        return failure(adminResult.error);
      }

      const validated = validate(adminListParamsSchema, params ?? {});
      const page = validated.page;
      const limit = validated.limit;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const supabase = await createClient();
      let query = supabase.from("reviews").select("*", { count: "exact" });

      if (validated.query) {
        const q = escapeIlikePattern(validated.query);
        query = query.or(
          `reviewer_name.ilike.%${q}%,reviewer_email.ilike.%${q}%,title.ilike.%${q}%,body.ilike.%${q}%`,
        );
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        return failure(new DatabaseError(error.message));
      }

      const total = count ?? 0;

      return success({
        items: (data ?? []).map((row) => mapReviewRow(row as ReviewRow)),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getProfessions(): Promise<ServiceResult<Profession[]>> {
    const method = "AdminService.getProfessions";

    try {
      const adminResult = await this.assertAdmin();
      if (!isSuccess(adminResult)) {
        return failure(adminResult.error);
      }

      const supabase = await createClient();
      const { data, error } = await supabase
        .from("professions")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        return failure(new DatabaseError(error.message));
      }

      return success(
        (data ?? []).map((row) => mapProfessionRow(row as ProfessionRow)),
      );
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async createProfession(
    input: CreateProfessionInput,
  ): Promise<ServiceResult<Profession>> {
    const method = "AdminService.createProfession";

    try {
      const adminResult = await this.assertAdmin();
      if (!isSuccess(adminResult)) {
        return failure(adminResult.error);
      }

      const validated = validate(adminCreateProfessionSchema, input);
      const supabase = await createClient();

      const { data: existing } = await supabase
        .from("professions")
        .select("id")
        .ilike("name", validated.name)
        .maybeSingle();

      if (existing) {
        return failure(new ConflictError("A profession with this name already exists"));
      }

      const { data, error } = await supabase
        .from("professions")
        .insert({
          name: validated.name,
          slug: validated.slug,
          icon: validated.icon ?? null,
        })
        .select("*")
        .single();

      if (error) {
        if (error.code === "23505") {
          return failure(new ConflictError("A profession with this slug already exists"));
        }
        return failure(new DatabaseError(error.message));
      }

      await writeAuditLog({
        adminId: adminResult.data.userId,
        action: "profession.created",
        entityType: "profession",
        entityId: data.id,
        metadata: { name: validated.name, slug: validated.slug },
      });

      logger.info(method, { adminId: adminResult.data.userId, professionId: data.id });
      return success(mapProfessionRow(data as ProfessionRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async updateProfession(
    id: string,
    input: UpdateProfessionInput,
  ): Promise<ServiceResult<Profession>> {
    const method = "AdminService.updateProfession";

    try {
      const adminResult = await this.assertAdmin();
      if (!isSuccess(adminResult)) {
        return failure(adminResult.error);
      }

      const { id: professionId } = validate(adminProfessionIdSchema, { id });
      const validated = validate(adminUpdateProfessionSchema, input);

      if (Object.keys(validated).length === 0) {
        return failure(new ValidationError("No profession fields to update"));
      }

      const supabase = await createClient();

      if (validated.name) {
        const { data: duplicate } = await supabase
          .from("professions")
          .select("id")
          .ilike("name", validated.name)
          .neq("id", professionId)
          .maybeSingle();

        if (duplicate) {
          return failure(new ConflictError("A profession with this name already exists"));
        }
      }

      const updates: Record<string, unknown> = {};
      if (validated.name !== undefined) updates.name = validated.name;
      if (validated.slug !== undefined) updates.slug = validated.slug;
      if (validated.icon !== undefined) updates.icon = validated.icon;
      if (validated.isDisabled !== undefined) updates.is_disabled = validated.isDisabled;

      const { data, error } = await supabase
        .from("professions")
        .update(updates)
        .eq("id", professionId)
        .select("*")
        .single();

      if (error) {
        if (error.code === "23505") {
          return failure(new ConflictError("A profession with this slug already exists"));
        }
        return failure(new DatabaseError(error.message));
      }

      if (!data) {
        return failure(new NotFoundError("Profession"));
      }

      await writeAuditLog({
        adminId: adminResult.data.userId,
        action: validated.isDisabled === true
          ? "profession.disabled"
          : validated.isDisabled === false
            ? "profession.enabled"
            : "profession.updated",
        entityType: "profession",
        entityId: professionId,
        metadata: updates,
      });

      return success(mapProfessionRow(data as ProfessionRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async deleteReview(id: string): Promise<ServiceResult<void>> {
    const method = "AdminService.deleteReview";

    try {
      const adminResult = await this.assertAdmin();
      if (!isSuccess(adminResult)) {
        return failure(adminResult.error);
      }

      const { id: reviewId } = validate(adminReviewIdSchema, { id });
      const supabase = await createClient();

      const { data: existing } = await supabase
        .from("reviews")
        .select("id, profile_id, reviewer_name, title")
        .eq("id", reviewId)
        .maybeSingle();

      if (!existing) {
        return failure(new NotFoundError("Review"));
      }

      const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

      if (error) {
        return failure(new DatabaseError(error.message));
      }

      await writeAuditLog({
        adminId: adminResult.data.userId,
        action: "review.deleted",
        entityType: "review",
        entityId: reviewId,
        metadata: {
          profileId: existing.profile_id,
          reviewerName: existing.reviewer_name,
          title: existing.title,
        },
      });

      logger.info(method, { adminId: adminResult.data.userId, reviewId });
      return success(undefined);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async deleteProfile(id: string): Promise<ServiceResult<void>> {
    const method = "AdminService.deleteProfile";

    try {
      const adminResult = await this.assertAdmin();
      if (!isSuccess(adminResult)) {
        return failure(adminResult.error);
      }

      const { id: profileId } = validate(adminProfileIdSchema, { id });

      if (profileId === adminResult.data.userId) {
        return failure(
          new AuthorizationError("You cannot delete your own profile from the admin panel"),
        );
      }

      const supabase = await createClient();

      const { data: ownerCheck } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", profileId)
        .maybeSingle();

      if (ownerCheck?.role === "owner") {
        return failure(new AuthorizationError("Owner accounts cannot be deleted"));
      }

      const { data: existing } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar")
        .eq("id", profileId)
        .maybeSingle();

      if (!existing) {
        return failure(new NotFoundError("Profile"));
      }

      if (existing.avatar) {
        await profileService.deleteAvatarByUrl(existing.avatar);
      }

      const { error } = await supabase.from("profiles").delete().eq("id", profileId);

      if (error) {
        return failure(new DatabaseError(error.message));
      }

      await writeAuditLog({
        adminId: adminResult.data.userId,
        action: "profile.deleted",
        entityType: "profile",
        entityId: profileId,
        metadata: {
          username: existing.username,
          displayName: existing.display_name,
        },
      });

      logger.info(method, { adminId: adminResult.data.userId, profileId });
      return success(undefined);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }
}

export const adminService = new AdminService();
