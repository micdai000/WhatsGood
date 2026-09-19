import { createClient } from "@/lib/supabase/client";
import { authService } from "@/services/auth/auth.service";
import {
  AuthorizationError,
  ConflictError,
  DatabaseError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { canCreateClaimRequest } from "@/lib/business/claim";
import {
  displayCategoryName,
  isOtherCategory,
  normalizeCustomCategory,
  sortCategoriesForSelect,
} from "@/lib/business/categories";
import { slugFromBusinessName, uniquifyBusinessSlug } from "@/lib/business/slug";
import { generateSecureCode } from "@/lib/qr/generate-code";
import { logger } from "@/lib/logger";
import { escapeIlikePattern } from "@/services/profiles/profile-search.query";
import {
  addBusinessMemberSchema,
  businessIdSchema,
  businessLocationIdSchema,
  businessLocationsByBusinessSchema,
  businessMemberIdSchema,
  businessMembersByBusinessSchema,
  businessSearchQuerySchema,
  businessSlugLookupSchema,
  completeBusinessOnboardingSchema,
  createClaimRequestSchema,
  createBusinessLocationSchema,
  createBusinessSchema,
  updateBusinessLocationSchema,
  updateBusinessMemberRoleSchema,
  updateBusinessSchema,
  validate,
} from "@/lib/validators";
import { failure, handleServiceError, success } from "@/services/shared";
import { LIMITS, PAGINATION } from "@/lib/constants";
import type {
  AddBusinessMemberInput,
  Business,
  BusinessCategory,
  BusinessClaimRequest,
  BusinessLocation,
  BusinessMember,
  BusinessMemberRole,
  BusinessSearchResult,
  CompleteBusinessOnboardingInput,
  CompleteBusinessOnboardingResult,
  CreateBusinessInput,
  CreateBusinessLocationInput,
  CreateClaimRequestInput,
  DiscoverableBusiness,
  PaginatedResult,
  ProfileSearchParams,
  ServiceResult,
  UpdateBusinessInput,
  UpdateBusinessLocationInput,
} from "@/types";
import { REPUTATION_TIERS, type ReputationTier } from "@/types/reputation";
import { isSuccess } from "@/types";
import {
  mapBusinessCategoryRow,
  type BusinessCategoryRow,
} from "./business-category.mapper";
import {
  mapBusinessLocationRow,
  type BusinessLocationRow,
} from "./business-location.mapper";
import {
  mapBusinessMemberRow,
  type BusinessMemberRow,
} from "./business-member.mapper";
import { mapBusinessRow, type BusinessRow } from "./business.mapper";
import {
  mapClaimRequestRow,
  type ClaimRequestRow,
} from "./business-claim.mapper";
import { mapQrCodeRow, type QrCodeRow } from "@/services/qr/qr.mapper";

function nullableText(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

type CategoryRef = { id: string; name: string; slug: string };

async function loadCategory(
  supabase: ReturnType<typeof createClient>,
  categoryId: string | null | undefined,
): Promise<CategoryRef | null> {
  if (!categoryId) return null;
  const { data } = await supabase
    .from("business_categories")
    .select("id, name, slug")
    .eq("id", categoryId)
    .maybeSingle();
  return (data as CategoryRef | null) ?? null;
}

function requireCustomCategory(
  category: CategoryRef | null,
  customCategory: string | null | undefined,
): ServiceResult<string | null> {
  const value = normalizeCustomCategory(category, customCategory);
  if (category && isOtherCategory(category)) {
    if (!value || value.length < LIMITS.CUSTOM_CATEGORY_MIN_LENGTH) {
      return failure(new ValidationError("Please describe your category"));
    }
    return success(value);
  }
  return success(null);
}

function parseOnboardingPayload(data: unknown): {
  business: BusinessRow;
  location: BusinessLocationRow;
  qr_code: QrCodeRow;
} | null {
  let value = data;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object") {
    return null;
  }
  const payload = value as {
    business?: BusinessRow;
    location?: BusinessLocationRow;
    qr_code?: QrCodeRow;
  };
  if (!payload.business || !payload.location || !payload.qr_code) {
    return null;
  }
  return {
    business: payload.business,
    location: payload.location,
    qr_code: payload.qr_code,
  };
}

function isSchemaCacheMiss(error: { code?: string; message?: string }): boolean {
  const code = error.code ?? "";
  const message = error.message ?? "";
  return (
    code === "PGRST202" ||
    code === "PGRST203" ||
    /schema cache/i.test(message)
  );
}

type RpcError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function isUniqueViolation(error: RpcError): boolean {
  const haystack = `${error.code ?? ""} ${error.message ?? ""} ${error.details ?? ""}`;
  return error.code === "23505" || /duplicate key|unique constraint/i.test(haystack);
}

function mapOnboardingRpcError(error: RpcError) {
  if (isUniqueViolation(error)) {
    return new ConflictError("This business name is already taken");
  }
  if (error.code === "42501") {
    return new AuthorizationError(
      error.message || "You must be signed in to create a business",
    );
  }
  if (
    error.code === "22023" ||
    error.code === "23503" ||
    error.code === "23514" ||
    error.code === "23502"
  ) {
    return new ValidationError(
      error.message || "Please check the business details and try again",
    );
  }
  return DatabaseError.fromSource({
    message: error.message || "A database error occurred",
  });
}

export class BusinessService {
  async getCategories(): Promise<ServiceResult<BusinessCategory[]>> {
    const method = "BusinessService.getCategories";

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("business_categories")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        logger.error(method, error);
        return failure(DatabaseError.fromSource(error));
      }

      return success(
        sortCategoriesForSelect(
          (data ?? []).map((row) =>
            mapBusinessCategoryRow(row as BusinessCategoryRow),
          ),
        ),
      );
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async createBusiness(
    input: CreateBusinessInput,
  ): Promise<ServiceResult<Business>> {
    const method = "BusinessService.createBusiness";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(
          new AuthorizationError("You must be signed in to create a business"),
        );
      }

      const validated = validate(createBusinessSchema, input);
      const supabase = createClient();
      const category = await loadCategory(supabase, validated.categoryId);
      const customResult = requireCustomCategory(
        category,
        validated.customCategory,
      );
      if (!isSuccess(customResult)) {
        return customResult;
      }
      const { data, error } = await supabase
        .from("businesses")
        .insert({
          slug: validated.slug,
          name: validated.name,
          description: nullableText(validated.description) ?? null,
          logo_url: validated.logoUrl ?? null,
          website_url:
            validated.websiteUrl ??
            (validated.socialLinks?.website?.trim()
              ? validated.socialLinks.website
              : null),
          social_links: validated.socialLinks ?? {},
          phone: nullableText(validated.phone) ?? null,
          email: validated.email ?? null,
          category_id: validated.categoryId ?? null,
          custom_category: customResult.data,
          is_claimed: true,
        })
        .select("*")
        .single();

      if (error) {
        logger.error(method, error);

        if (error.code === "23505") {
          return failure(new ConflictError("This business slug is already taken"));
        }

        return failure(DatabaseError.fromSource(error));
      }

      logger.info(method, {
        userId: sessionResult.data.user.id,
        businessId: data.id,
      });
      return success(mapBusinessRow(data as BusinessRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getBusiness(id: string): Promise<ServiceResult<Business>> {
    const method = "BusinessService.getBusiness";

    try {
      const { id: businessId } = validate(businessIdSchema, { id });
      const supabase = createClient();
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .maybeSingle();

      if (error) {
        logger.error(method, error, { id: businessId });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("Business"));
      }

      return success(mapBusinessRow(data as BusinessRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getBusinessBySlug(slug: string): Promise<ServiceResult<Business>> {
    const method = "BusinessService.getBusinessBySlug";

    try {
      const { slug: businessSlug } = validate(businessSlugLookupSchema, {
        slug,
      });
      const supabase = createClient();
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("slug", businessSlug)
        .maybeSingle();

      if (error) {
        logger.error(method, error, { slug: businessSlug });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("Business"));
      }

      return success(mapBusinessRow(data as BusinessRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async updateBusiness(
    id: string,
    input: UpdateBusinessInput,
  ): Promise<ServiceResult<Business>> {
    const method = "BusinessService.updateBusiness";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(
          new AuthorizationError("You must be signed in to update a business"),
        );
      }

      const { id: businessId } = validate(businessIdSchema, { id });
      const validated = validate(updateBusinessSchema, input);
      const supabase = createClient();
      const updates: Record<string, unknown> = {};

      if (validated.name !== undefined) {
        updates.name = validated.name;
      }
      if (validated.description !== undefined) {
        updates.description = nullableText(validated.description) ?? null;
      }
      if (validated.logoUrl !== undefined) {
        updates.logo_url = validated.logoUrl;
      }
      if (validated.socialLinks !== undefined) {
        updates.social_links = validated.socialLinks;
        if (validated.websiteUrl === undefined) {
          const website = validated.socialLinks.website?.trim();
          updates.website_url = website ? website : null;
        }
      }
      if (validated.websiteUrl !== undefined) {
        updates.website_url = validated.websiteUrl;
      }
      if (validated.phone !== undefined) {
        updates.phone = nullableText(validated.phone) ?? null;
      }
      if (validated.email !== undefined) {
        updates.email = validated.email;
      }
      if (validated.categoryId !== undefined) {
        updates.category_id = validated.categoryId;
        const category = await loadCategory(supabase, validated.categoryId);
        const customResult = requireCustomCategory(
          category,
          validated.customCategory,
        );
        if (!isSuccess(customResult)) {
          return customResult;
        }
        updates.custom_category = customResult.data;
      } else if (validated.customCategory !== undefined) {
        updates.custom_category = nullableText(validated.customCategory) ?? null;
      }
      if (validated.status !== undefined) {
        updates.status = validated.status;
      }

      const { data, error } = await supabase
        .from("businesses")
        .update(updates)
        .eq("id", businessId)
        .select("*")
        .maybeSingle();

      if (error) {
        logger.error(method, error, { id: businessId });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("Business"));
      }

      return success(mapBusinessRow(data as BusinessRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getMyBusinesses(): Promise<ServiceResult<Business[]>> {
    const method = "BusinessService.getMyBusinesses";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(
          new AuthorizationError("You must be signed in to list your businesses"),
        );
      }

      const userId = sessionResult.data.user.id;
      const supabase = createClient();
      const { data: memberships, error: membershipError } = await supabase
        .from("business_members")
        .select("business_id")
        .eq("user_id", userId);

      if (membershipError) {
        logger.error(method, membershipError, { userId });
        return failure(DatabaseError.fromSource(membershipError));
      }

      const businessIds = (memberships ?? []).map(
        (row) => row.business_id as string,
      );

      if (businessIds.length === 0) {
        return success([]);
      }

      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .in("id", businessIds)
        .order("name", { ascending: true });

      if (error) {
        logger.error(method, error, { userId });
        return failure(DatabaseError.fromSource(error));
      }

      return success(
        (data ?? []).map((row) => mapBusinessRow(row as BusinessRow)),
      );
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getLocations(
    businessId: string,
  ): Promise<ServiceResult<BusinessLocation[]>> {
    const method = "BusinessService.getLocations";

    try {
      const { businessId: validatedBusinessId } = validate(
        businessLocationsByBusinessSchema,
        { businessId },
      );
      const supabase = createClient();
      const { data, error } = await supabase
        .from("business_locations")
        .select("*")
        .eq("business_id", validatedBusinessId)
        .order("is_primary", { ascending: false })
        .order("city", { ascending: true });

      if (error) {
        logger.error(method, error, { businessId: validatedBusinessId });
        return failure(DatabaseError.fromSource(error));
      }

      return success(
        (data ?? []).map((row) =>
          mapBusinessLocationRow(row as BusinessLocationRow),
        ),
      );
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async createLocation(
    input: CreateBusinessLocationInput,
  ): Promise<ServiceResult<BusinessLocation>> {
    const method = "BusinessService.createLocation";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(
          new AuthorizationError("You must be signed in to add a location"),
        );
      }

      const validated = validate(createBusinessLocationSchema, input);
      const supabase = createClient();

      if (validated.isPrimary) {
        const clearError = await this.clearPrimaryLocation(
          supabase,
          validated.businessId,
        );
        if (clearError) {
          return clearError;
        }
      }

      const { data, error } = await supabase
        .from("business_locations")
        .insert({
          business_id: validated.businessId,
          name: nullableText(validated.name) ?? null,
          address_line_1: nullableText(validated.addressLine1) ?? null,
          address_line_2: nullableText(validated.addressLine2) ?? null,
          city: validated.city,
          state: validated.state,
          postal_code: nullableText(validated.postalCode) ?? null,
          country: validated.country ?? "US",
          phone: nullableText(validated.phone) ?? null,
          is_primary: validated.isPrimary ?? false,
        })
        .select("*")
        .single();

      if (error) {
        logger.error(method, error, { businessId: validated.businessId });

        if (error.code === "23505") {
          return failure(
            new ConflictError("This business already has a primary location"),
          );
        }

        return failure(DatabaseError.fromSource(error));
      }

      return success(mapBusinessLocationRow(data as BusinessLocationRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async updateLocation(
    locationId: string,
    input: UpdateBusinessLocationInput,
  ): Promise<ServiceResult<BusinessLocation>> {
    const method = "BusinessService.updateLocation";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(
          new AuthorizationError("You must be signed in to update a location"),
        );
      }

      const { id: validatedLocationId } = validate(businessLocationIdSchema, {
        id: locationId,
      });
      const validated = validate(updateBusinessLocationSchema, input);
      const supabase = createClient();

      if (validated.isPrimary) {
        const existing = await supabase
          .from("business_locations")
          .select("business_id")
          .eq("id", validatedLocationId)
          .maybeSingle();

        if (existing.error) {
          logger.error(method, existing.error, { id: validatedLocationId });
          return failure(DatabaseError.fromSource(existing.error));
        }

        if (!existing.data) {
          return failure(new NotFoundError("Location"));
        }

        const clearError = await this.clearPrimaryLocation(
          supabase,
          existing.data.business_id as string,
          validatedLocationId,
        );
        if (clearError) {
          return clearError;
        }
      }

      const updates: Record<string, unknown> = {};

      if (validated.name !== undefined) {
        updates.name = nullableText(validated.name) ?? null;
      }
      if (validated.addressLine1 !== undefined) {
        updates.address_line_1 = nullableText(validated.addressLine1) ?? null;
      }
      if (validated.addressLine2 !== undefined) {
        updates.address_line_2 = nullableText(validated.addressLine2) ?? null;
      }
      if (validated.city !== undefined) {
        updates.city = validated.city;
      }
      if (validated.state !== undefined) {
        updates.state = validated.state;
      }
      if (validated.postalCode !== undefined) {
        updates.postal_code = nullableText(validated.postalCode) ?? null;
      }
      if (validated.country !== undefined) {
        updates.country = validated.country;
      }
      if (validated.phone !== undefined) {
        updates.phone = nullableText(validated.phone) ?? null;
      }
      if (validated.isPrimary !== undefined) {
        updates.is_primary = validated.isPrimary;
      }

      const { data, error } = await supabase
        .from("business_locations")
        .update(updates)
        .eq("id", validatedLocationId)
        .select("*")
        .maybeSingle();

      if (error) {
        logger.error(method, error, { id: validatedLocationId });

        if (error.code === "23505") {
          return failure(
            new ConflictError("This business already has a primary location"),
          );
        }

        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("Location"));
      }

      return success(mapBusinessLocationRow(data as BusinessLocationRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async deleteLocation(locationId: string): Promise<ServiceResult<void>> {
    const method = "BusinessService.deleteLocation";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(
          new AuthorizationError("You must be signed in to delete a location"),
        );
      }

      const { id: validatedLocationId } = validate(businessLocationIdSchema, {
        id: locationId,
      });
      const supabase = createClient();
      const { data, error } = await supabase
        .from("business_locations")
        .delete()
        .eq("id", validatedLocationId)
        .select("id")
        .maybeSingle();

      if (error) {
        logger.error(method, error, { id: validatedLocationId });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("Location"));
      }

      return success(undefined);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getMembers(
    businessId: string,
  ): Promise<ServiceResult<BusinessMember[]>> {
    const method = "BusinessService.getMembers";

    try {
      const { businessId: validatedBusinessId } = validate(
        businessMembersByBusinessSchema,
        { businessId },
      );
      const supabase = createClient();
      const { data, error } = await supabase
        .from("business_members")
        .select("*")
        .eq("business_id", validatedBusinessId)
        .order("created_at", { ascending: true });

      if (error) {
        logger.error(method, error, { businessId: validatedBusinessId });
        return failure(DatabaseError.fromSource(error));
      }

      return success(
        (data ?? []).map((row) =>
          mapBusinessMemberRow(row as BusinessMemberRow),
        ),
      );
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async addMember(
    input: AddBusinessMemberInput,
  ): Promise<ServiceResult<BusinessMember>> {
    const method = "BusinessService.addMember";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(
          new AuthorizationError("You must be signed in to add a member"),
        );
      }

      const validated = validate(addBusinessMemberSchema, input);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("business_members")
        .insert({
          business_id: validated.businessId,
          user_id: validated.userId,
          role: validated.role,
        })
        .select("*")
        .single();

      if (error) {
        logger.error(method, error, { businessId: validated.businessId });

        if (error.code === "23505") {
          return failure(
            new ConflictError("This user is already a member of the business"),
          );
        }

        return failure(DatabaseError.fromSource(error));
      }

      return success(mapBusinessMemberRow(data as BusinessMemberRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async updateMemberRole(
    memberId: string,
    role: BusinessMemberRole,
  ): Promise<ServiceResult<BusinessMember>> {
    const method = "BusinessService.updateMemberRole";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(
          new AuthorizationError("You must be signed in to update a member"),
        );
      }

      const validated = validate(updateBusinessMemberRoleSchema, {
        id: memberId,
        role,
      });
      const supabase = createClient();
      const { data, error } = await supabase
        .from("business_members")
        .update({ role: validated.role })
        .eq("id", validated.id)
        .select("*")
        .maybeSingle();

      if (error) {
        logger.error(method, error, { id: validated.id });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("Business member"));
      }

      return success(mapBusinessMemberRow(data as BusinessMemberRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async removeMember(memberId: string): Promise<ServiceResult<void>> {
    const method = "BusinessService.removeMember";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(
          new AuthorizationError("You must be signed in to remove a member"),
        );
      }

      const { id: validatedMemberId } = validate(businessMemberIdSchema, {
        id: memberId,
      });
      const supabase = createClient();
      const { data, error } = await supabase
        .from("business_members")
        .delete()
        .eq("id", validatedMemberId)
        .select("id")
        .maybeSingle();

      if (error) {
        logger.error(method, error, { id: validatedMemberId });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("Business member"));
      }

      return success(undefined);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async completeOnboarding(
    input: CompleteBusinessOnboardingInput,
  ): Promise<ServiceResult<CompleteBusinessOnboardingResult>> {
    const method = "BusinessService.completeOnboarding";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(
          new AuthorizationError("You must be signed in to create a business"),
        );
      }

      const validated = validate(completeBusinessOnboardingSchema, input);
      const supabase = createClient();
      const category = await loadCategory(supabase, validated.categoryId);
      const customResult = requireCustomCategory(
        category,
        validated.customCategory,
      );
      if (!isSuccess(customResult)) {
        return customResult;
      }
      const baseSlug = slugFromBusinessName(validated.name);

      for (let attempt = 0; attempt < 4; attempt += 1) {
        const slug = uniquifyBusinessSlug(baseSlug, attempt);
        const rpcParams: Record<string, unknown> = {
          p_name: validated.name,
          p_slug: slug,
          p_category_id: validated.categoryId,
          p_description: nullableText(validated.description) ?? null,
          p_website_url: validated.websiteUrl ?? null,
          p_phone: nullableText(validated.phone) ?? null,
          p_email: validated.email ?? null,
          p_logo_url: validated.logoUrl ?? null,
          p_address_line_1: nullableText(validated.addressLine1) ?? null,
          p_city: validated.city,
          p_state: validated.state,
          p_postal_code: nullableText(validated.postalCode) ?? null,
          p_country: validated.country ?? "US",
          p_qr_code: generateSecureCode(),
          p_qr_label: "Primary Business QR",
        };
        if (customResult.data) {
          rpcParams.p_custom_category = customResult.data;
        }

        let { data, error } = await supabase.rpc(
          "complete_business_onboarding",
          rpcParams,
        );

        if (error && isSchemaCacheMiss(error) && "p_custom_category" in rpcParams) {
          delete rpcParams.p_custom_category;
          ({ data, error } = await supabase.rpc(
            "complete_business_onboarding",
            rpcParams,
          ));
        }

        if (error) {
          if (isUniqueViolation(error) && attempt < 3) {
            continue;
          }

          logger.error(method, error, {
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
          return failure(mapOnboardingRpcError(error));
        }

        const payload = parseOnboardingPayload(data);
        if (!payload) {
          logger.error(method, "Onboarding RPC returned an unexpected payload", {
            data,
          });
          return failure(new DatabaseError());
        }

        let business = mapBusinessRow(payload.business);
        const location = mapBusinessLocationRow(payload.location);
        const qrCode = mapQrCodeRow(payload.qr_code);

        if (customResult.data && business.customCategory !== customResult.data) {
          const saved = await this.updateBusiness(business.id, {
            customCategory: customResult.data,
          });
          if (isSuccess(saved)) {
            business = saved.data;
          }
        }

        return success({
          business,
          location,
          qrCode,
        });
      }

      return failure(new ConflictError("This business name is already taken"));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async searchBusinesses(
    query: string,
  ): Promise<ServiceResult<BusinessSearchResult[]>> {
    const method = "BusinessService.searchBusinesses";

    try {
      const { query: search } = validate(businessSearchQuerySchema, { query });
      const supabase = createClient();
      const pattern = `%${escapeIlikePattern(search)}%`;
      const { data, error } = await supabase
        .from("businesses")
        .select(
          `
          id,
          name,
          slug,
          is_claimed,
          custom_category,
          business_categories ( name, slug ),
          business_locations ( city, state, is_primary )
        `,
        )
        .eq("status", "active")
        .ilike("name", pattern)
        .order("name", { ascending: true })
        .limit(20);

      if (error) {
        logger.error(method, error, { query: search });
        return failure(DatabaseError.fromSource(error));
      }

      const results = (data ?? []).map((row) => {
        const categoryRel = row.business_categories as
          | { name: string; slug?: string }
          | { name: string; slug?: string }[]
          | null;
        const category = Array.isArray(categoryRel)
          ? categoryRel[0]
          : categoryRel;
        const locations = (row.business_locations ?? []) as Array<{
          city: string;
          state: string;
          is_primary: boolean;
        }>;
        const primary =
          locations.find((location) => location.is_primary) ?? locations[0];

        return {
          id: row.id as string,
          name: row.name as string,
          slug: row.slug as string,
          isClaimed: Boolean(row.is_claimed),
          categoryName: displayCategoryName(
            category,
            row.custom_category as string | null,
          ),
          city: primary?.city ?? null,
          state: primary?.state ?? null,
        } satisfies BusinessSearchResult;
      });

      return success(results);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async listPublicBusinesses(
    params?: ProfileSearchParams,
  ): Promise<ServiceResult<PaginatedResult<DiscoverableBusiness>>> {
    const method = "BusinessService.listPublicBusinesses";

    try {
      const page = params?.page ?? PAGINATION.DEFAULT_PAGE;
      const limit = Math.min(params?.limit ?? 12, PAGINATION.MAX_LIMIT);
      const supabase = createClient();

      let query = supabase
        .from("businesses")
        .select(
          `
          id,
          name,
          slug,
          logo_url,
          is_claimed,
          custom_category,
          current_reputation_score,
          current_reputation_tier,
          current_reputation_period,
          total_feedback,
          created_at,
          business_categories ( name, slug ),
          business_locations ( city, state, is_primary )
        `,
          { count: "exact" },
        )
        .eq("status", "active")
        .eq("is_claimed", true);

      if (params?.professionId) {
        query = query.eq("category_id", params.professionId);
      }

      if (params?.query) {
        query = query.ilike(
          "name",
          `%${escapeIlikePattern(params.query)}%`,
        );
      }

      switch (params?.sort) {
        case "rating":
          query = query.order("current_reputation_score", {
            ascending: false,
            nullsFirst: false,
          });
          break;
        case "reviews":
          query = query.order("total_feedback", { ascending: false });
          break;
        case "name":
          query = query.order("name", { ascending: true });
          break;
        case "newest":
        default:
          query = query.order("created_at", { ascending: false });
          break;
      }

      const { data, error, count } = await query;

      if (error) {
        logger.error(method, error, { params });
        return failure(DatabaseError.fromSource(error));
      }

      const cityFilter = params?.city?.trim().toLowerCase();
      const stateFilter = params?.state?.trim().toLowerCase();

      const mapped = (data ?? []).map((row) => {
        const categoryRel = row.business_categories as
          | { name: string; slug?: string }
          | { name: string; slug?: string }[]
          | null;
        const category = Array.isArray(categoryRel)
          ? categoryRel[0]
          : categoryRel;
        const locations = (row.business_locations ?? []) as Array<{
          city: string;
          state: string;
          is_primary: boolean;
        }>;
        const primary =
          locations.find((location) => location.is_primary) ?? locations[0];
        const tier = row.current_reputation_tier as string;

        return {
          id: row.id as string,
          name: row.name as string,
          slug: row.slug as string,
          isClaimed: Boolean(row.is_claimed),
          categoryName: displayCategoryName(
            category,
            row.custom_category as string | null,
          ),
          city: primary?.city ?? null,
          state: primary?.state ?? null,
          logoUrl: (row.logo_url as string | null) ?? null,
          reputationTier: (REPUTATION_TIERS as readonly string[]).includes(tier)
            ? (tier as ReputationTier)
            : "building",
          reputationPeriod: (row.current_reputation_period as string | null) ?? null,
          totalFeedback: Number(row.total_feedback ?? 0),
        } satisfies DiscoverableBusiness;
      });

      const filtered = mapped.filter((business) => {
        if (
          cityFilter &&
          !(business.city ?? "").toLowerCase().includes(cityFilter)
        ) {
          return false;
        }
        if (
          stateFilter &&
          !(business.state ?? "").toLowerCase().includes(stateFilter)
        ) {
          return false;
        }
        return true;
      });

      const total = cityFilter || stateFilter ? filtered.length : (count ?? filtered.length);
      const from = (page - 1) * limit;
      const items = filtered.slice(from, from + limit);

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

  async createClaimRequest(
    input: CreateClaimRequestInput,
  ): Promise<ServiceResult<BusinessClaimRequest>> {
    const method = "BusinessService.createClaimRequest";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(
          new AuthorizationError("You must be signed in to claim a business"),
        );
      }

      const validated = validate(createClaimRequestSchema, input);
      const businessResult = await this.getBusiness(validated.businessId);

      if (!isSuccess(businessResult)) {
        return businessResult;
      }

      if (!canCreateClaimRequest(businessResult.data.isClaimed)) {
        return failure(
          new ConflictError("This business is already claimed."),
        );
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("business_claim_requests")
        .insert({
          business_id: validated.businessId,
          user_id: sessionResult.data.user.id,
          status: "pending",
        })
        .select("*")
        .single();

      if (error) {
        logger.error(method, error, { businessId: validated.businessId });

        if (error.code === "23505") {
          return failure(
            new ConflictError("You already have a pending claim for this business"),
          );
        }

        return failure(DatabaseError.fromSource(error));
      }

      return success(mapClaimRequestRow(data as ClaimRequestRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getMyClaimRequests(): Promise<ServiceResult<BusinessClaimRequest[]>> {
    const method = "BusinessService.getMyClaimRequests";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(
          new AuthorizationError("You must be signed in to view claim requests"),
        );
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("business_claim_requests")
        .select("*")
        .eq("user_id", sessionResult.data.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        logger.error(method, error);
        return failure(DatabaseError.fromSource(error));
      }

      return success(
        (data ?? []).map((row) => mapClaimRequestRow(row as ClaimRequestRow)),
      );
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  private async clearPrimaryLocation(
    supabase: ReturnType<typeof createClient>,
    businessId: string,
    exceptLocationId?: string,
  ): Promise<ServiceResult<never> | null> {
    let query = supabase
      .from("business_locations")
      .update({ is_primary: false })
      .eq("business_id", businessId)
      .eq("is_primary", true);

    if (exceptLocationId) {
      query = query.neq("id", exceptLocationId);
    }

    const { error } = await query;

    if (error) {
      logger.error("BusinessService.clearPrimaryLocation", error, {
        businessId,
      });
      return failure(DatabaseError.fromSource(error));
    }

    return null;
  }
}

export const businessService = new BusinessService();
