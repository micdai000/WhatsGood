/** Build a `tel:` href from a stored phone value, or null when it is not callable. */
export function toTelHref(phone: string | null | undefined): string | null {
  const trimmed = phone?.trim() ?? "";
  if (!trimmed) return null;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7) return null;

  if (trimmed.startsWith("+")) {
    return `tel:+${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `tel:+${digits}`;
  }

  if (digits.length === 10) {
    return `tel:+1${digits}`;
  }

  return `tel:${digits}`;
}
