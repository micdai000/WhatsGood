import type { Profession } from "@/types";

export type ProfessionRow = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  is_disabled: boolean;
  created_at: string;
};

export function mapProfessionRow(row: ProfessionRow): Profession {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    isDisabled: row.is_disabled ?? false,
    createdAt: row.created_at,
  };
}
