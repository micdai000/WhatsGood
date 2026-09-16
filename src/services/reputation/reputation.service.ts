import { createClient } from "@/lib/supabase/client";
import { DatabaseError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  reputationHistorySchema,
  reputationLocationSchema,
  reputationQuerySchema,
  validate,
} from "@/lib/validators";
import { failure, handleServiceError, success } from "@/services/shared";
import type { ReputationSnapshot, ServiceResult } from "@/types";
import {
  mapReputationSnapshotRow,
  type ReputationSnapshotRow,
} from "./reputation.mapper";

export class ReputationService {
  async getLatestSnapshot(
    businessId: string,
  ): Promise<ServiceResult<ReputationSnapshot | null>> {
    const method = "ReputationService.getLatestSnapshot";

    try {
      const { businessId: validatedBusinessId } = validate(
        reputationQuerySchema,
        { businessId },
      );
      const supabase = createClient();
      const { data, error } = await supabase
        .from("reputation_snapshots")
        .select("*")
        .eq("business_id", validatedBusinessId)
        .is("location_id", null)
        .order("computed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logger.error(method, error, { businessId: validatedBusinessId });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return success(null);
      }

      return success(mapReputationSnapshotRow(data as ReputationSnapshotRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getSnapshotHistory(
    businessId: string,
    limit?: number,
  ): Promise<ServiceResult<ReputationSnapshot[]>> {
    const method = "ReputationService.getSnapshotHistory";

    try {
      const validated = validate(reputationHistorySchema, {
        businessId,
        limit,
      });
      const supabase = createClient();
      const { data, error } = await supabase
        .from("reputation_snapshots")
        .select("*")
        .eq("business_id", validated.businessId)
        .is("location_id", null)
        .order("computed_at", { ascending: false })
        .limit(validated.limit ?? 12);

      if (error) {
        logger.error(method, error, { businessId: validated.businessId });
        return failure(DatabaseError.fromSource(error));
      }

      return success(
        (data ?? []).map((row) =>
          mapReputationSnapshotRow(row as ReputationSnapshotRow),
        ),
      );
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getLocationSnapshot(
    businessId: string,
    locationId: string,
  ): Promise<ServiceResult<ReputationSnapshot | null>> {
    const method = "ReputationService.getLocationSnapshot";

    try {
      const validated = validate(reputationLocationSchema, {
        businessId,
        locationId,
      });
      const supabase = createClient();
      const { data, error } = await supabase
        .from("reputation_snapshots")
        .select("*")
        .eq("business_id", validated.businessId)
        .eq("location_id", validated.locationId)
        .order("computed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logger.error(method, error, {
          businessId: validated.businessId,
          locationId: validated.locationId,
        });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return success(null);
      }

      return success(mapReputationSnapshotRow(data as ReputationSnapshotRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }
}

export const reputationService = new ReputationService();
