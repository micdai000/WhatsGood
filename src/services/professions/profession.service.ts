import "server-only";

import { createClient } from "@/lib/supabase/server";
import { DatabaseError, NotFoundError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { professionIdSchema, professionSlugSchema, validate } from "@/lib/validators";
import { failure, handleServiceError, success } from "@/services/shared";
import type { Profession, ServiceResult } from "@/types";
import { mapProfessionRow, type ProfessionRow } from "./profession.mapper";

export class ProfessionService {
  async getProfessions(): Promise<ServiceResult<Profession[]>> {
    const method = "ProfessionService.getProfessions";

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("professions")
        .select("*")
        .eq("is_disabled", false)
        .order("name", { ascending: true });

      if (error) {
        logger.error(method, error);
        return failure(DatabaseError.fromSource(error));
      }

      const professions = (data ?? []).map((row) =>
        mapProfessionRow(row as ProfessionRow),
      );

      return success(professions);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getProfession(id: string): Promise<ServiceResult<Profession>> {
    const method = "ProfessionService.getProfession";

    try {
      const { id: professionId } = validate(professionIdSchema, { id });
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("professions")
        .select("*")
        .eq("id", professionId)
        .maybeSingle();

      if (error) {
        logger.error(method, error, { id: professionId });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("Profession"));
      }

      return success(mapProfessionRow(data as ProfessionRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getProfessionBySlug(slug: string): Promise<ServiceResult<Profession>> {
    const method = "ProfessionService.getProfessionBySlug";

    try {
      const { slug: professionSlug } = validate(professionSlugSchema, { slug });
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("professions")
        .select("*")
        .eq("slug", professionSlug)
        .maybeSingle();

      if (error) {
        logger.error(method, error, { slug: professionSlug });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("Profession"));
      }

      return success(mapProfessionRow(data as ProfessionRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }
}

export const professionService = new ProfessionService();
