import { createClient } from "@/lib/supabase/client";
import { requireAdmin } from "@/lib/admin/authorization";
import { ConflictError, DatabaseError, NotFoundError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { slugFromBusinessName, uniquifyBusinessSlug } from "@/lib/business/slug";
import { generateSecureCode } from "@/lib/qr/generate-code";
import {
  businessIdSchema,
  claimIdSchema,
  completeBusinessOnboardingSchema,
  validate,
} from "@/lib/validators";
import {
  mapBusinessRow,
  type BusinessRow,
} from "@/services/businesses/business.mapper";
import {
  mapBusinessLocationRow,
  type BusinessLocationRow,
} from "@/services/businesses/business-location.mapper";
import {
  mapClaimRequestRow,
  type ClaimRequestRow,
} from "@/services/businesses/business-claim.mapper";
import { escapeIlikePattern } from "@/services/profiles/profile-search.query";
import {
  failure,
  handleServiceError,
  mapRpcError,
  success,
} from "@/services/shared";
import type {
  AdminBusinessClaim,
  Business,
  BusinessClaimRequest,
  BusinessLocation,
  BusinessStatus,
  ClaimRequestStatus,
  CompleteBusinessOnboardingInput,
  PaginatedResult,
  ServiceResult,
} from "@/types";
import { isSuccess } from "@/types";
import { writeAuditLog } from "./admin.audit";

export type AdminListingFilter =
  | "all"
  | "unverified"
  | "unclaimed"
  | "suspended";

export interface AdminListing {
  business: Business;
  city: string | null;
  state: string | null;
}

export interface AdminListingDetail {
  business: Business;
  location: BusinessLocation | null;
}

type ListingRow = BusinessRow & {
  business_locations:
    | Array<{ city: string | null; state: string | null; is_primary: boolean }>
    | null;
};

function nullableText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export class AdminBusinessService {
  async listListings(params: {
    query?: string;
    filter?: AdminListingFilter;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<PaginatedResult<AdminListing>>> {
    const method = "AdminBusinessService.listListings";

    try {
      const adminResult = await requireAdmin();
      if (!isSuccess(adminResult)) {
        return failure(adminResult.error);
      }

      const page = Math.max(1, params.page ?? 1);
      const limit = Math.min(100, Math.max(1, params.limit ?? 20));
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const supabase = createClient();
      let query = supabase
        .from("businesses")
        .select("*, business_locations ( city, state, is_primary )", {
          count: "exact",
        });

      switch (params.filter) {
        case "unverified":
          query = query.eq("is_verified", false).neq("status", "suspended");
          break;
        case "unclaimed":
          query = query.eq("is_claimed", false);
          break;
        case "suspended":
          query = query.eq("status", "suspended");
          break;
        default:
          break;
      }

      if (params.query?.trim()) {
        query = query.ilike("name", `%${escapeIlikePattern(params.query.trim())}%`);
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        logger.error(method, error);
        return failure(DatabaseError.fromSource(error));
      }

      const total = count ?? 0;
      const items = (data ?? []).map((row) => {
        const listing = row as ListingRow;
        const locations = listing.business_locations ?? [];
        const primary =
          locations.find((location) => location.is_primary) ?? locations[0];
        return {
          business: mapBusinessRow(listing),
          city: primary?.city ?? null,
          state: primary?.state ?? null,
        } satisfies AdminListing;
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

  async getListing(id: string): Promise<ServiceResult<AdminListingDetail>> {
    const method = "AdminBusinessService.getListing";

    try {
      const adminResult = await requireAdmin();
      if (!isSuccess(adminResult)) {
        return failure(adminResult.error);
      }

      const { id: businessId } = validate(businessIdSchema, { id });
      const supabase = createClient();
      const [businessResult, locationResult] = await Promise.all([
        supabase.from("businesses").select("*").eq("id", businessId).maybeSingle(),
        supabase
          .from("business_locations")
          .select("*")
          .eq("business_id", businessId)
          .order("is_primary", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (businessResult.error) {
        return failure(DatabaseError.fromSource(businessResult.error));
      }
      if (!businessResult.data) {
        return failure(new NotFoundError("Business"));
      }

      return success({
        business: mapBusinessRow(businessResult.data as BusinessRow),
        location: locationResult.data
          ? mapBusinessLocationRow(locationResult.data as BusinessLocationRow)
          : null,
      });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async createListing(
    input: CompleteBusinessOnboardingInput,
  ): Promise<ServiceResult<Business>> {
    const method = "AdminBusinessService.createListing";

    try {
      const adminResult = await requireAdmin();
      if (!isSuccess(adminResult)) {
        return failure(adminResult.error);
      }

      const validated = validate(completeBusinessOnboardingSchema, input);
      const supabase = createClient();
      const baseSlug = slugFromBusinessName(validated.name);

      for (let attempt = 0; attempt < 4; attempt += 1) {
        const { data, error } = await supabase.rpc("admin_create_listing", {
          p_name: validated.name,
          p_slug: uniquifyBusinessSlug(baseSlug, attempt),
          p_category_id: validated.categoryId,
          p_description: nullableText(validated.description),
          p_website_url: nullableText(validated.websiteUrl),
          p_phone: nullableText(validated.phone),
          p_email: nullableText(validated.email),
          p_logo_url: nullableText(validated.logoUrl),
          p_address_line_1: nullableText(validated.addressLine1),
          p_city: validated.city,
          p_state: validated.state,
          p_postal_code: nullableText(validated.postalCode),
          p_country: validated.country ?? "US",
          p_qr_code: generateSecureCode(),
          p_custom_category: nullableText(validated.customCategory),
        });

        if (error) {
          if (error.code === "23505" && attempt < 3) {
            continue;
          }
          logger.error(method, error);
          return mapRpcError(error, "This business name is already taken");
        }

        const payload = data as { business: BusinessRow } | null;
        if (!payload?.business) {
          return failure(new DatabaseError());
        }

        logger.info(method, {
          adminId: adminResult.data.userId,
          businessId: payload.business.id,
        });
        return success(mapBusinessRow(payload.business));
      }

      return failure(new ConflictError("This business name is already taken"));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async updateListing(
    businessId: string,
    locationId: string | null,
    input: CompleteBusinessOnboardingInput,
  ): Promise<ServiceResult<void>> {
    const method = "AdminBusinessService.updateListing";

    try {
      const adminResult = await requireAdmin();
      if (!isSuccess(adminResult)) {
        return failure(adminResult.error);
      }

      const { id } = validate(businessIdSchema, { id: businessId });
      const validated = validate(completeBusinessOnboardingSchema, input);
      const supabase = createClient();
      const websiteUrl = nullableText(validated.websiteUrl);

      const { data: existing, error: existingError } = await supabase
        .from("businesses")
        .select("social_links")
        .eq("id", id)
        .maybeSingle();

      if (existingError) {
        return failure(DatabaseError.fromSource(existingError));
      }
      if (!existing) {
        return failure(new NotFoundError("Business"));
      }

      const socialLinks = {
        ...((existing.social_links as Record<string, unknown> | null) ?? {}),
        website: websiteUrl ?? "",
      };

      const { error } = await supabase
        .from("businesses")
        .update({
          name: validated.name,
          category_id: validated.categoryId,
          custom_category: nullableText(validated.customCategory),
          description: nullableText(validated.description),
          website_url: websiteUrl,
          social_links: socialLinks,
          phone: nullableText(validated.phone),
          email: nullableText(validated.email),
          logo_url: nullableText(validated.logoUrl),
        })
        .eq("id", id);

      if (error) {
        logger.error(method, error, { id });
        return mapRpcError(error);
      }

      const locationFields = {
        address_line_1: nullableText(validated.addressLine1),
        city: validated.city,
        state: validated.state,
        postal_code: nullableText(validated.postalCode),
        country: validated.country ?? "US",
      };

      const locationResult = locationId
        ? await supabase
            .from("business_locations")
            .update(locationFields)
            .eq("id", locationId)
            .eq("business_id", id)
        : await supabase
            .from("business_locations")
            .insert({ ...locationFields, business_id: id, is_primary: true });

      if (locationResult.error) {
        logger.error(method, locationResult.error, { id });
        return mapRpcError(locationResult.error);
      }

      await writeAuditLog({
        adminId: adminResult.data.userId,
        action: "business.listing_updated",
        entityType: "business",
        entityId: id,
        metadata: { name: validated.name },
      });

      return success(undefined);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async setVerified(
    businessId: string,
    isVerified: boolean,
  ): Promise<ServiceResult<void>> {
    return this.updateFlags(
      businessId,
      { is_verified: isVerified },
      isVerified ? "business.verified" : "business.unverified",
    );
  }

  async setStatus(
    businessId: string,
    status: BusinessStatus,
  ): Promise<ServiceResult<void>> {
    return this.updateFlags(businessId, { status }, `business.status_${status}`);
  }

  async listClaims(
    status: ClaimRequestStatus | "all" = "pending",
  ): Promise<ServiceResult<AdminBusinessClaim[]>> {
    const method = "AdminBusinessService.listClaims";

    try {
      const adminResult = await requireAdmin();
      if (!isSuccess(adminResult)) {
        return failure(adminResult.error);
      }

      const supabase = createClient();
      const { data, error } = await supabase.rpc("admin_list_business_claims", {
        p_status: status === "all" ? null : status,
      });

      if (error) {
        logger.error(method, error);
        return mapRpcError(error);
      }

      const rows = (data ?? []) as Array<{
        claim: ClaimRequestRow;
        claimant_email: string | null;
        business: BusinessRow;
        city: string | null;
        state: string | null;
        code_attempts: number | null;
      }>;

      return success(
        rows.map((row) => ({
          claim: mapClaimRequestRow(row.claim),
          claimantEmail: row.claimant_email,
          business: mapBusinessRow(row.business),
          city: row.city,
          state: row.state,
          codeAttempts: row.code_attempts,
        })),
      );
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async issueClaimCode(claimId: string): Promise<ServiceResult<string>> {
    const method = "AdminBusinessService.issueClaimCode";

    try {
      const validated = validate(claimIdSchema, { claimId });
      const supabase = createClient();
      const { data, error } = await supabase.rpc("admin_issue_claim_code", {
        p_claim_id: validated.claimId,
      });

      if (error) {
        logger.error(method, error, { claimId });
        return mapRpcError(error);
      }

      return success(String(data));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async approveClaim(
    claimId: string,
    notes?: string,
  ): Promise<ServiceResult<BusinessClaimRequest>> {
    return this.reviewClaim("admin_approve_business_claim", claimId, notes);
  }

  async rejectClaim(
    claimId: string,
    notes?: string,
  ): Promise<ServiceResult<BusinessClaimRequest>> {
    return this.reviewClaim("admin_reject_business_claim", claimId, notes);
  }

  private async reviewClaim(
    rpc: "admin_approve_business_claim" | "admin_reject_business_claim",
    claimId: string,
    notes?: string,
  ): Promise<ServiceResult<BusinessClaimRequest>> {
    const method = `AdminBusinessService.${rpc}`;

    try {
      const validated = validate(claimIdSchema, { claimId });
      const supabase = createClient();
      const { data, error } = await supabase.rpc(rpc, {
        p_claim_id: validated.claimId,
        p_notes: nullableText(notes),
      });

      if (error) {
        logger.error(method, error, { claimId });
        return mapRpcError(error);
      }

      return success(mapClaimRequestRow(data as ClaimRequestRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  private async updateFlags(
    businessId: string,
    updates: Record<string, unknown>,
    action: string,
  ): Promise<ServiceResult<void>> {
    const method = "AdminBusinessService.updateFlags";

    try {
      const adminResult = await requireAdmin();
      if (!isSuccess(adminResult)) {
        return failure(adminResult.error);
      }

      const { id } = validate(businessIdSchema, { id: businessId });
      const supabase = createClient();
      const { data, error } = await supabase
        .from("businesses")
        .update(updates)
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (error) {
        logger.error(method, error, { id });
        return mapRpcError(error);
      }
      if (!data) {
        return failure(new NotFoundError("Business"));
      }

      await writeAuditLog({
        adminId: adminResult.data.userId,
        action,
        entityType: "business",
        entityId: id,
        metadata: updates,
      });

      return success(undefined);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }
}

export const adminBusinessService = new AdminBusinessService();
