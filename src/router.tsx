import { createBrowserRouter, Navigate, Outlet, useParams } from "react-router-dom";
import { RootLayout } from "@/root-layout";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Container } from "@/components/layout/container";
import { RequireAuth } from "@/components/route-guards/require-auth";
import { RequireDashboard } from "@/components/route-guards/require-dashboard";
import { RequireOnboarding } from "@/components/route-guards/require-onboarding";
import { RequireAdmin } from "@/components/route-guards/require-admin";
import AuthCallbackPage, {
  LegacyAuthRedirect,
} from "@/pages/auth-callback-page";

import HomePage from "@/app/page";
import AboutPage from "@/app/about/page";
import SearchPage from "@/app/search/page";
import LoginPage from "@/app/(auth)/login/page";
import SignupPage from "@/app/(auth)/signup/page";
import ForgotPasswordPage from "@/app/(auth)/forgot-password/page";
import ResetPasswordPage from "@/app/(auth)/reset-password/page";
import WelcomePage from "@/app/(onboarding)/welcome/page";
import OnboardingNamePage from "@/app/(onboarding)/onboarding/name/page";
import OnboardingUsernamePage from "@/app/(onboarding)/onboarding/username/page";
import OnboardingPhotoPage from "@/app/(onboarding)/onboarding/photo/page";
import OnboardingBioPage from "@/app/(onboarding)/onboarding/bio/page";
import OnboardingLocationPage from "@/app/(onboarding)/onboarding/location/page";
import OnboardingProfessionPage from "@/app/(onboarding)/onboarding/profession/page";
import OnboardingReviewPage from "@/app/(onboarding)/onboarding/review/page";
import DashboardPage from "@/app/(dashboard)/dashboard/page";
import DashboardProfileEditPage from "@/app/(dashboard)/dashboard/profile/edit/page";
import DashboardReviewRequestsPage from "@/app/(dashboard)/dashboard/review-requests/page";
import DashboardSettingsPage from "@/app/(dashboard)/dashboard/settings/page";
import CreatePage from "@/app/(protected)/create/page";
import EntityPage from "@/app/(protected)/entity/[id]/page";
import ProfilePage from "@/app/(protected)/profile/page";
import StyleGuidePage from "@/app/(protected)/style-guide/page";
import AdminPage from "@/app/(admin)/admin/page";
import AdminUsersPage from "@/app/(admin)/admin/users/page";
import AdminProfilesPage from "@/app/(admin)/admin/profiles/page";
import AdminReviewsPage from "@/app/(admin)/admin/reviews/page";
import AdminProfessionsPage from "@/app/(admin)/admin/professions/page";
import PublicProfilePage from "@/app/u/[slug]/page";
import ReviewPage from "@/app/review/[slug]/page";
import ReviewRequestPage from "@/app/review/request/[token]/page";
import { OnboardingWizardProvider } from "@/contexts/onboarding-wizard-context";

function AuthLayout() {
  return (
    <PageWrapper variant="muted">
      <Container className="flex min-h-[calc(100dvh-4rem)] items-center justify-center py-10">
        <Outlet />
      </Container>
    </PageWrapper>
  );
}

function AtUsernameRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/u/${slug}`} replace />;
}

function OnboardingWizardLayout() {
  return (
    <OnboardingWizardProvider>
      <Outlet />
    </OnboardingWizardProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "pricing", element: <Navigate to="/" replace /> },
      { path: "search", element: <SearchPage /> },
      { path: "auth/callback", element: <AuthCallbackPage /> },
      { path: "auth/login", element: <LegacyAuthRedirect to="/login" /> },
      { path: "auth/signup", element: <LegacyAuthRedirect to="/signup" /> },
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "signup", element: <SignupPage /> },
          { path: "forgot-password", element: <ForgotPasswordPage /> },
          { path: "reset-password", element: <ResetPasswordPage /> },
        ],
      },
      {
        element: <RequireOnboarding />,
        children: [
          { path: "welcome", element: <WelcomePage /> },
          {
            element: <OnboardingWizardLayout />,
            children: [
              { path: "onboarding/name", element: <OnboardingNamePage /> },
              { path: "onboarding/username", element: <OnboardingUsernamePage /> },
              { path: "onboarding/photo", element: <OnboardingPhotoPage /> },
              { path: "onboarding/bio", element: <OnboardingBioPage /> },
              { path: "onboarding/location", element: <OnboardingLocationPage /> },
              { path: "onboarding/profession", element: <OnboardingProfessionPage /> },
              { path: "onboarding/review", element: <OnboardingReviewPage /> },
            ],
          },
        ],
      },
      {
        element: <RequireDashboard />,
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          { path: "dashboard/profile/edit", element: <DashboardProfileEditPage /> },
          { path: "dashboard/review-requests", element: <DashboardReviewRequestsPage /> },
          { path: "dashboard/settings", element: <DashboardSettingsPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          { path: "create", element: <CreatePage /> },
          { path: "entity/:id", element: <EntityPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "style-guide", element: <StyleGuidePage /> },
        ],
      },
      {
        element: <RequireAdmin />,
        children: [
          { path: "admin", element: <AdminPage /> },
          { path: "admin/users", element: <AdminUsersPage /> },
          { path: "admin/profiles", element: <AdminProfilesPage /> },
          { path: "admin/reviews", element: <AdminReviewsPage /> },
          { path: "admin/professions", element: <AdminProfessionsPage /> },
        ],
      },
      { path: "u/:slug", element: <PublicProfilePage /> },
      { path: "@:slug", element: <AtUsernameRedirect /> },
      { path: "review/:slug", element: <ReviewPage /> },
      { path: "review/request/:token", element: <ReviewRequestPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
