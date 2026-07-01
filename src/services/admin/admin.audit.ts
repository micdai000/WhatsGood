import "server-only";

import { createClient } from "@/lib/supabase/server";
import { DatabaseError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { AuditLogEntry, ServiceResult } from "@/types";
import { failure, success } from "@/services/shared";

type AuditLogRow = {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

function mapAuditLogRow(row: AuditLogRow): AuditLogEntry {
  return {
    id: row.id,
    adminId: row.admin_id ?? "",
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

export async function writeAuditLog(input: {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<ServiceResult<AuditLogEntry>> {
  const method = "writeAuditLog";

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .insert({
        admin_id: input.adminId,
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId ?? null,
        metadata: input.metadata ?? {},
      })
      .select("*")
      .single();

    if (error) {
      logger.error(method, error, input);
      return failure(new DatabaseError(error.message));
    }

    return success(mapAuditLogRow(data as AuditLogRow));
  } catch (error) {
    logger.error(method, error, input);
    return failure(new DatabaseError("Failed to write audit log"));
  }
}
