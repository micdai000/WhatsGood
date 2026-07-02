import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  ONBOARDING_ROUTES,
  resolveOnboardingRedirect,
} from "@/lib/onboarding/constants";
import { profileExistsForUser } from "@/lib/onboarding/profile-check";
import { isAuthRoute, isPublicRoute } from "@/lib/auth/routes";
import { checkAdminInMiddleware } from "@/lib/admin/authorization";
import { isAdminRoute } from "@/lib/admin/routes";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = isPublicRoute(pathname);
  const isAuth = isAuthRoute(pathname);

  if (!user && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute(pathname)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isAdmin = await checkAdminInMiddleware(supabase, user.id);

    if (!isAdmin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
  }

  if (user) {
    const hasProfile = await profileExistsForUser(supabase, user.id);
    const onboardingRedirect = resolveOnboardingRedirect(pathname, hasProfile);

    if (onboardingRedirect) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = onboardingRedirect;
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    if (isAuth && pathname !== "/login" && pathname !== "/signup") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = hasProfile
        ? ONBOARDING_ROUTES.dashboard
        : ONBOARDING_ROUTES.welcome;
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
