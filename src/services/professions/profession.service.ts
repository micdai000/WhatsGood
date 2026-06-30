import type { Profession, ServiceResult } from "@/types";
import { notImplemented } from "../shared";

export class ProfessionService {
  async getProfessions(): Promise<ServiceResult<Profession[]>> {
    return notImplemented("ProfessionService.getProfessions");
  }

  async getProfession(_id: string): Promise<ServiceResult<Profession>> {
    return notImplemented("ProfessionService.getProfession");
  }

  async getProfessionBySlug(
    _slug: string,
  ): Promise<ServiceResult<Profession>> {
    return notImplemented("ProfessionService.getProfessionBySlug");
  }
}

export const professionService = new ProfessionService();
