export type AuthCallbackParams = {
  code: string | null;
  tokenHash: string | null;
  type: string | null;
  error: string | null;
  errorCode: string | null;
  next: string | null;
  accessToken: string | null;
  refreshToken: string | null;
};

function readParams(value: string, stripPrefix: "?" | "#"): URLSearchParams {
  const trimmed = value.startsWith(stripPrefix) ? value.slice(1) : value;
  return new URLSearchParams(trimmed);
}

/** Merge query + hash params from a Supabase auth redirect. */
export function parseAuthCallbackParams(
  search: string,
  hash = "",
): AuthCallbackParams {
  const query = readParams(search, "?");
  const hashParams = readParams(hash, "#");

  return {
    code: query.get("code") || hashParams.get("code"),
    tokenHash: query.get("token_hash") || hashParams.get("token_hash"),
    type: query.get("type") || hashParams.get("type"),
    error: query.get("error") || hashParams.get("error"),
    errorCode: query.get("error_code") || hashParams.get("error_code"),
    next: query.get("next"),
    accessToken: query.get("access_token") || hashParams.get("access_token"),
    refreshToken: query.get("refresh_token") || hashParams.get("refresh_token"),
  };
}

export function toEmailOtpType(
  type: string | null,
): "email" | "signup" | "recovery" {
  if (type === "signup" || type === "recovery" || type === "email") {
    return type;
  }
  return "email";
}

export function isExpiredAuthCallback(params: AuthCallbackParams): boolean {
  if (!params.error && !params.errorCode) {
    return false;
  }

  const error = (params.error ?? "").toLowerCase();
  const errorCode = (params.errorCode ?? "").toLowerCase();

  return (
    errorCode.includes("otp_expired") ||
    errorCode.includes("expired") ||
    error.includes("expired") ||
    error === "access_denied"
  );
}
