import { Navigate } from "react-router-dom";
import { ONBOARDING_ROUTES } from "@/lib/onboarding/constants";

export default function WelcomePage() {
  return <Navigate to={ONBOARDING_ROUTES.business} replace />;
}
