import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authService } from "@/services/auth/auth.service";
import { isFailure } from "@/types";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/login";

  if (tokenHash && type === "email") {
    const result = await authService.verifyEmail(tokenHash);

    if (isFailure(result)) {
      const url = new URL("/login", origin);
      url.searchParams.set("error", result.error.code);
      return NextResponse.redirect(url);
    }

    const url = new URL("/login", origin);
    url.searchParams.set("verified", "true");
    return NextResponse.redirect(url);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const url = new URL("/login", origin);
      url.searchParams.set("error", "EXPIRED_TOKEN");
      return NextResponse.redirect(url);
    }

    if (type === "recovery") {
      return NextResponse.redirect(new URL("/reset-password", origin));
    }

    // Email verification should not auto-login before explicit sign-in.
    await supabase.auth.signOut();

    const url = new URL(type === "signup" ? "/login" : next, origin);
    if (type === "signup") {
      url.searchParams.set("verified", "true");
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL("/login", origin));
}
