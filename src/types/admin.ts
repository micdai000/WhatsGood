export type AdminRole = "owner" | "admin";

export interface AdminUser {
  userId: string;
  role: AdminRole;
  createdAt: string;
  createdBy: string | null;
}

export interface AuditLogEntry {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AdminPlatformUser {
  id: string;
  email: string;
  createdAt: string;
  adminRole: AdminRole | null;
  hasProfile: boolean;
  profileUsername: string | null;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalProfiles: number;
  totalReviews: number;
  pendingReviewRequests: number;
  averagePlatformRating: number;
}

export interface AdminActivityItem {
  id: string;
  type: "review" | "profile" | "review_request" | "audit";
  title: string;
  description: string;
  timestamp: string;
}

export interface AdminDashboardData {
  statistics: AdminDashboardStats;
  recentActivity: AdminActivityItem[];
}

export interface CreateProfessionInput {
  name: string;
  slug: string;
  icon?: string | null;
}

export interface UpdateProfessionInput {
  name?: string;
  slug?: string;
  icon?: string | null;
  isDisabled?: boolean;
}

export interface AdminListParams {
  query?: string;
  page?: number;
  limit?: number;
}
