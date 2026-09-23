import { LIMITS } from "@/lib/constants";
import type { SocialLinks } from "@/types";
import { DEFAULT_SOCIAL_LINKS } from "@/types/profile";

export type SocialUsernamePlatform = "instagram" | "facebook" | "x";
export type SocialLinkPlatform = SocialUsernamePlatform | "website";

/** Normalize DB JSONB (including `{}` / null / partial objects) into SocialLinks. */
export function normalizeSocialLinks(value: unknown): SocialLinks {
  const raw =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const links: SocialLinks = { ...DEFAULT_SOCIAL_LINKS };

  for (const [key, entry] of Object.entries(raw)) {
    if (typeof entry === "string") {
      links[key] = entry;
    }
  }

  return links;
}

type PlatformConfig = {
  label: string;
  hostnames: string[];
  canonicalHost: string;
  /** Allowed characters in a vanity username (without leading @). */
  usernamePattern: RegExp;
  invalidMessage: string;
};

const PLATFORM_CONFIG: Record<SocialUsernamePlatform, PlatformConfig> = {
  instagram: {
    label: "Instagram",
    hostnames: ["instagram.com", "www.instagram.com"],
    canonicalHost: "instagram.com",
    usernamePattern: /^[A-Za-z0-9._]{1,30}$/,
    invalidMessage: "Enter a valid Instagram username or profile URL.",
  },
  facebook: {
    label: "Facebook",
    hostnames: ["facebook.com", "www.facebook.com", "fb.com", "www.fb.com", "m.facebook.com"],
    canonicalHost: "facebook.com",
    usernamePattern: /^[A-Za-z0-9.]{5,50}$/,
    invalidMessage: "Enter a valid Facebook username or profile URL.",
  },
  x: {
    label: "X",
    hostnames: ["x.com", "www.x.com", "twitter.com", "www.twitter.com", "mobile.twitter.com"],
    canonicalHost: "x.com",
    usernamePattern: /^[A-Za-z0-9_]{1,15}$/,
    invalidMessage: "Enter a valid X username or profile URL.",
  },
};

const RESERVED_PATH_SEGMENTS = new Set([
  "p",
  "reel",
  "reels",
  "stories",
  "explore",
  "accounts",
  "direct",
  "about",
  "privacy",
  "help",
  "settings",
  "watch",
  "marketplace",
  "gaming",
  "groups",
  "events",
  "pages",
  "profile.php",
  "share",
  "intent",
  "i",
  "home",
  "search",
]);

function trimInput(value: string): string {
  return value.trim();
}

function stripLeadingAt(value: string): string {
  return value.replace(/^@+/, "");
}

function hostnameMatches(hostname: string, allowed: string[]): boolean {
  const host = hostname.toLowerCase();
  return allowed.some((candidate) => host === candidate.toLowerCase());
}

function tryParseUrl(value: string): URL | null {
  const candidates = [value];

  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value)) {
    candidates.unshift(`https://${value}`);
  }

  for (const candidate of candidates) {
    try {
      return new URL(candidate);
    } catch {
      // try next candidate
    }
  }

  return null;
}

function extractPathUsername(pathname: string): string | null {
  const segment = pathname
    .split("/")
    .map((part) => part.trim())
    .find((part) => part.length > 0);

  if (!segment) return null;

  const username = stripLeadingAt(decodeURIComponent(segment));
  if (!username || RESERVED_PATH_SEGMENTS.has(username.toLowerCase())) {
    return null;
  }

  return username;
}

function looksLikeDomainPath(value: string, hostnames: string[]): boolean {
  const lower = value.toLowerCase();
  return hostnames.some((hostname) => {
    const host = hostname.toLowerCase();
    return (
      lower === host ||
      lower.startsWith(`${host}/`) ||
      lower.startsWith(`www.${host.replace(/^www\./, "")}/`)
    );
  });
}

export function extractSocialUsername(
  platform: SocialUsernamePlatform,
  storedUrl: string,
): string {
  const value = trimInput(storedUrl);
  if (!value) return "";

  const config = PLATFORM_CONFIG[platform];
  const parsed = tryParseUrl(value);

  if (parsed && hostnameMatches(parsed.hostname, config.hostnames)) {
    return extractPathUsername(parsed.pathname) ?? "";
  }

  return stripLeadingAt(value);
}

export function toSocialInputValue(
  platform: SocialUsernamePlatform,
  storedUrl: string,
): string {
  return extractSocialUsername(platform, storedUrl);
}

export function toWebsiteInputValue(storedUrl: string): string {
  return trimInput(storedUrl);
}

export function socialLinksToFormValues(links: SocialLinks): SocialLinks {
  return {
    ...DEFAULT_SOCIAL_LINKS,
    ...links,
    instagram: toSocialInputValue("instagram", links.instagram ?? ""),
    facebook: toSocialInputValue("facebook", links.facebook ?? ""),
    x: toSocialInputValue("x", links.x ?? ""),
    website: toWebsiteInputValue(links.website ?? ""),
  };
}

export function validateSocialUsernameInput(
  platform: SocialUsernamePlatform,
  rawValue: string,
): string | null {
  const value = trimInput(rawValue);
  if (!value) return null;

  if (value.length > LIMITS.SOCIAL_LINK_MAX_LENGTH) {
    return `Link must be ${LIMITS.SOCIAL_LINK_MAX_LENGTH} characters or fewer.`;
  }

  const normalized = normalizeSocialUsernameInput(platform, value);
  if (!normalized) {
    return PLATFORM_CONFIG[platform].invalidMessage;
  }

  return null;
}

export function validateWebsiteInput(rawValue: string): string | null {
  const value = trimInput(rawValue);
  if (!value) return null;

  if (value.length > LIMITS.SOCIAL_LINK_MAX_LENGTH) {
    return `Link must be ${LIMITS.SOCIAL_LINK_MAX_LENGTH} characters or fewer.`;
  }

  const normalized = normalizeWebsiteInput(value);
  if (!normalized) {
    return "Enter a valid website URL.";
  }

  return null;
}

export function normalizeSocialUsernameInput(
  platform: SocialUsernamePlatform,
  rawValue: string,
): string {
  const value = trimInput(rawValue);
  if (!value) return "";

  const config = PLATFORM_CONFIG[platform];
  let username: string | null = null;

  const parsed =
    value.includes("://") || looksLikeDomainPath(value, config.hostnames)
      ? tryParseUrl(value)
      : null;

  if (parsed && hostnameMatches(parsed.hostname, config.hostnames)) {
    username = extractPathUsername(parsed.pathname);
  } else if (parsed && value.includes("://")) {
    // Explicit URL for a different host is invalid for this platform.
    return "";
  } else {
    username = stripLeadingAt(value);
  }

  if (!username || !config.usernamePattern.test(username)) {
    return "";
  }

  // Facebook vanity names cannot be purely numeric.
  if (platform === "facebook" && /^\d+$/.test(username)) {
    return "";
  }

  return `https://${config.canonicalHost}/${username}`;
}

export function normalizeWebsiteInput(rawValue: string): string {
  const value = trimInput(rawValue);
  if (!value) return "";

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value)
    ? value
    : `https://${value}`;

  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    return "";
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "";
  }

  if (!parsed.hostname.includes(".")) {
    return "";
  }

  return parsed.toString();
}

/** Normalize form values into canonical URLs for persistence. */
export function normalizeSocialLinksForSave(formValues: SocialLinks): SocialLinks {
  return {
    ...formValues,
    instagram: normalizeSocialUsernameInput("instagram", formValues.instagram ?? ""),
    facebook: normalizeSocialUsernameInput("facebook", formValues.facebook ?? ""),
    x: normalizeSocialUsernameInput("x", formValues.x ?? ""),
    website: normalizeWebsiteInput(formValues.website ?? ""),
  };
}

export function validateSocialLinksFormValues(
  formValues: SocialLinks,
): Partial<Record<SocialLinkPlatform, string>> {
  const errors: Partial<Record<SocialLinkPlatform, string>> = {};

  const instagramError = validateSocialUsernameInput("instagram", formValues.instagram ?? "");
  if (instagramError) errors.instagram = instagramError;

  const facebookError = validateSocialUsernameInput("facebook", formValues.facebook ?? "");
  if (facebookError) errors.facebook = facebookError;

  const xError = validateSocialUsernameInput("x", formValues.x ?? "");
  if (xError) errors.x = xError;

  const websiteError = validateWebsiteInput(formValues.website ?? "");
  if (websiteError) errors.website = websiteError;

  return errors;
}

export type DisplaySocialLink = {
  platform: SocialLinkPlatform;
  href: string;
  label: string;
  tooltip: string;
};

const DISPLAY_PLATFORM_META: Record<
  SocialLinkPlatform,
  { label: string; tooltip: string }
> = {
  instagram: { label: "Instagram", tooltip: "Open Instagram" },
  facebook: { label: "Facebook", tooltip: "Open Facebook" },
  x: { label: "X", tooltip: "Open X" },
  website: { label: "Website", tooltip: "Visit Website" },
};

const DISPLAY_PLATFORM_ORDER: SocialLinkPlatform[] = [
  "instagram",
  "facebook",
  "x",
  "website",
];

function isDisplayableHttpUrl(value: string): boolean {
  const trimmed = trimInput(value);
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Active professional links for read-only display (skips empty/invalid values). */
export function getDisplayableSocialLinks(
  links: SocialLinks | null | undefined,
): DisplaySocialLink[] {
  if (!links) return [];

  const result: DisplaySocialLink[] = [];

  for (const platform of DISPLAY_PLATFORM_ORDER) {
    const href = trimInput(links[platform] ?? "");
    if (!isDisplayableHttpUrl(href)) continue;

    const meta = DISPLAY_PLATFORM_META[platform];
    result.push({
      platform,
      href,
      label: meta.label,
      tooltip: meta.tooltip,
    });
  }

  return result;
}
