import { describe, expect, it } from "vitest";
import {
  isExpiredAuthCallback,
  parseAuthCallbackParams,
} from "@/lib/auth/callback-params";

describe("parseAuthCallbackParams", () => {
  it("reads implicit-flow errors from the hash", () => {
    const params = parseAuthCallbackParams(
      "?type=signup",
      "#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired&sb=",
    );

    expect(params.type).toBe("signup");
    expect(params.error).toBe("access_denied");
    expect(params.errorCode).toBe("otp_expired");
    expect(isExpiredAuthCallback(params)).toBe(true);
  });

  it("reads PKCE codes from the query string", () => {
    const params = parseAuthCallbackParams("?code=abc&type=recovery");

    expect(params.code).toBe("abc");
    expect(params.type).toBe("recovery");
    expect(isExpiredAuthCallback(params)).toBe(false);
  });

  it("reads implicit access tokens from the hash", () => {
    const params = parseAuthCallbackParams(
      "",
      "#access_token=tok&refresh_token=ref&type=signup",
    );

    expect(params.accessToken).toBe("tok");
    expect(params.refreshToken).toBe("ref");
    expect(params.type).toBe("signup");
  });
});
