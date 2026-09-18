export function getAccountDisplayName(input: {
  fullName?: string | null;
  email: string;
}): string {
  const fullName = input.fullName?.trim();
  if (fullName) return fullName;

  const localPart = input.email.split("@")[0]?.trim();
  return localPart || "Account";
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
