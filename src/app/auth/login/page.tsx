import { Navigate } from "react-router-dom";

export default function LegacyLoginRedirect() {
  return <Navigate to="/login" replace />;
}
