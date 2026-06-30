import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { formatDate } from "./utils/format-date"
export { formatRating } from "./utils/format-rating"
export { slugify } from "./utils/slugify"
export { truncate } from "./utils/truncate"
export { capitalize } from "./utils/capitalize"
export { generateSlug, sanitizeSlug, validateSlug } from "./utils/slug"
