import { Navigate } from "react-router-dom";

export default function LegacySignupRedirect() {
  return <Navigate to="/signup" replace />;
}
