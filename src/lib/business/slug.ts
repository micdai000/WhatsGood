import { generateSlug } from "@/lib/utils/slug";

export function slugFromBusinessName(name: string): string {
  const slug = generateSlug(name);
  return slug.length > 0 ? slug : "business";
}

export function uniquifyBusinessSlug(base: string, attempt: number): string {
  if (attempt <= 0) {
    return base;
  }

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}
