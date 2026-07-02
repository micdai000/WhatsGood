import "server-only";

import { createClient } from "@/lib/supabase/server";
import { authService } from "@/services/auth/auth.service";
import { AuthorizationError } from "@/lib/errors";
import { failure, success } from "@/services/shared";
import type { AdminRole, AdminUser, ServiceResult } from "@/types";
import { isSuccess } from "@/types";

type AdminUserRow = {
  user_id: string;
  role: AdminRole;
  created_at: string;
  created_by: string | null;
};

function mapAdminUser(row: AdminUserRow): AdminUser {
  return {
    userId: row.user_id,
    role: row.role,
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const sessionResult = await authService.getSession();

  if (!isSuccess(sessionResult) || !sessionResult.data) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_users")
    .select("user_id, role, created_at, created_by")
    .eq("user_id", sessionResult.data.user.id)
    .maybeSingle();

  return data ? mapAdminUser(data as AdminUserRow) : null;
}

export async function isAdmin(userId?: string): Promise<boolean> {
  const sessionResult = await authService.getSession();

  if (!isSuccess(sessionResult) || !sessionResult.data) {
    return false;
  }

  const targetId = userId ?? sessionResult.data.user.id;
  const supabase = await createClient();

  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", targetId)
    .maybeSingle();

  return Boolean(data);
}

export async function isOwner(userId?: string): Promise<boolean> {
  const sessionResult = await authService.getSession();

  if (!isSuccess(sessionResult) || !sessionResult.data) {
    return false;
  }

  const targetId = userId ?? sessionResult.data.user.id;
  const supabase = await createClient();

  const { data } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", targetId)
    .maybeSingle();

  return data?.role === "owner";
}

export async function requireAdmin(): Promise<ServiceResult<AdminUser>> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return failure(new AuthorizationError("Administrator access required"));
  }

  return success(admin);
}

export async function requireOwner(): Promise<ServiceResult<AdminUser>> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return failure(new AuthorizationError("Administrator access required"));
  }

  if (admin.role !== "owner") {
    return failure(new AuthorizationError("Owner access required"));
  }

  return success(admin);
}

import type { SupabaseClient } from "@supabase/supabase-js";

export async function checkAdminInMiddleware(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  return Boolean(data);
}
