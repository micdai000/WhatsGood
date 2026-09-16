import { createClient } from "@/lib/supabase/client";
import { authService } from "@/services/auth/auth.service";
import {
  AuthorizationError,
  ConflictError,
  DatabaseError,
  NotFoundError,
} from "@/lib/errors";
import { generateSecureCode } from "@/lib/qr/generate-code";
import { logger } from "@/lib/logger";
import {
  createQrCodeSchema,
  qrCodeIdSchema,
  qrCodeLookupSchema,
  qrCodesByBusinessSchema,
  updateQrCodeSchema,
  validate,
} from "@/lib/validators";
import { failure, handleServiceError, success } from "@/services/shared";
import {
  mapResolvedPublicQr,
  type ResolvedPublicQr,
} from "@/lib/qr/resolve-public-qr";
import type {
  BusinessQrCode,
  CreateQrCodeInput,
  PublicBusinessQrCode,
  ServiceResult,
  UpdateQrCodeInput,
} from "@/types";
import { isSuccess } from "@/types";
import {
  mapPublicQrCodeRow,
  mapQrCodeRow,
  type QrCodeRow,
} from "./qr.mapper";

const PUBLIC_QR_COLUMNS = "id, business_id, location_id, code, is_active";

export class QrCodeService {
  async createQrCode(
    input: CreateQrCodeInput,
  ): Promise<ServiceResult<BusinessQrCode>> {
    const method = "QrCodeService.createQrCode";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(
          new AuthorizationError("You must be signed in to create a QR code"),
        );
      }

      const validated = validate(createQrCodeSchema, input);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("business_qr_codes")
        .insert({
          business_id: validated.businessId,
          location_id: validated.locationId ?? null,
          code: generateSecureCode(),
          label: validated.label?.trim() ? validated.label.trim() : null,
        })
        .select("*")
        .single();

      if (error) {
        logger.error(method, error, { businessId: validated.businessId });

        if (error.code === "23505") {
          return failure(new ConflictError("This QR code already exists"));
        }

        return failure(DatabaseError.fromSource(error));
      }

      return success(mapQrCodeRow(data as QrCodeRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getQrCodes(
    businessId: string,
  ): Promise<ServiceResult<BusinessQrCode[]>> {
    const method = "QrCodeService.getQrCodes";

    try {
      const { businessId: validatedBusinessId } = validate(
        qrCodesByBusinessSchema,
        { businessId },
      );
      const supabase = createClient();
      const { data, error } = await supabase
        .from("business_qr_codes")
        .select("*")
        .eq("business_id", validatedBusinessId)
        .order("created_at", { ascending: false });

      if (error) {
        logger.error(method, error, { businessId: validatedBusinessId });
        return failure(DatabaseError.fromSource(error));
      }

      return success((data ?? []).map((row) => mapQrCodeRow(row as QrCodeRow)));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getQrCodeByCode(
    code: string,
  ): Promise<ServiceResult<PublicBusinessQrCode>> {
    const method = "QrCodeService.getQrCodeByCode";

    try {
      const { code: qrCode } = validate(qrCodeLookupSchema, { code });
      const supabase = createClient();
      const { data, error } = await supabase
        .from("business_qr_codes")
        .select(PUBLIC_QR_COLUMNS)
        .eq("code", qrCode)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        logger.error(method, error);
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("QR code"));
      }

      return success(mapPublicQrCodeRow(data as QrCodeRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async resolvePublicQr(code: string): Promise<ServiceResult<ResolvedPublicQr>> {
    const method = "QrCodeService.resolvePublicQr";

    try {
      const { code: qrCode } = validate(qrCodeLookupSchema, { code });
      const supabase = createClient();
      const { data, error } = await supabase.rpc("resolve_public_qr", {
        p_code: qrCode,
      });

      if (error) {
        logger.error(method, error);
        return failure(DatabaseError.fromSource(error));
      }

      return success(
        mapResolvedPublicQr(
          (data ?? { status: "not_found" }) as {
            status?: string;
            slug?: string | null;
            qr?: {
              id: string;
              business_id: string;
              location_id: string | null;
              code: string;
              is_active: boolean;
            } | null;
          },
        ),
      );
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async updateQrCode(
    id: string,
    input: UpdateQrCodeInput,
  ): Promise<ServiceResult<BusinessQrCode>> {
    const method = "QrCodeService.updateQrCode";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(
          new AuthorizationError("You must be signed in to update a QR code"),
        );
      }

      const { id: qrCodeId } = validate(qrCodeIdSchema, { id });
      const validated = validate(updateQrCodeSchema, input);
      const updates: Record<string, unknown> = {};

      if (validated.label !== undefined) {
        updates.label = validated.label?.trim() ? validated.label.trim() : null;
      }
      if (validated.isActive !== undefined) {
        updates.is_active = validated.isActive;
      }
      if (validated.locationId !== undefined) {
        updates.location_id = validated.locationId;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("business_qr_codes")
        .update(updates)
        .eq("id", qrCodeId)
        .select("*")
        .maybeSingle();

      if (error) {
        logger.error(method, error, { id: qrCodeId });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("QR code"));
      }

      return success(mapQrCodeRow(data as QrCodeRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }
}

export const qrCodeService = new QrCodeService();
