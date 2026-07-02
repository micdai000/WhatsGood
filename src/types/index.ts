export type { ServiceResult, SuccessResult, FailureResult } from "./service-result";
export { success, failure, isSuccess, isFailure } from "./service-result";

export type { Profile, PublicProfile, CreateProfileInput, UpdateProfileInput } from "./profile";
export type {
  ProfileSearchParams,
  ProfileSearchResult,
  ProfileSortOrder,
} from "./search";
export { PROFILE_SORT_ORDERS } from "./search";
export type { Review, CreateReviewInput, RatingBreakdown } from "./review";
export type {
  DashboardActivityItem,
  DashboardActivityType,
  DashboardData,
  DashboardProfile,
  DashboardStatistics,
  PlaceholderMetric,
  ReviewGrowth,
  ReviewTrend,
  ReviewTrendPoint,
} from "./dashboard";
export type {
  ReviewRequest,
  ReviewRequestStatus,
  ReviewRequestWithProfile,
  CreateReviewRequestInput,
} from "./review-request";
export type { Profession } from "./profession";
export type {
  AdminActivityItem,
  AdminDashboardData,
  AdminDashboardStats,
  AdminListParams,
  AdminPlatformUser,
  AdminRole,
  AdminUser,
  AuditLogEntry,
  CreateProfessionInput,
  UpdateProfessionInput,
} from "./admin";
export type {
  AuthUser,
  AuthSession,
  SignUpInput,
  SignInInput,
  ResetPasswordInput,
  UpdatePasswordInput,
} from "./auth";
export type { PaginationParams, PaginatedResult } from "./pagination";
export type { ApiErrorResponse, ApiSuccessResponse } from "./api";
