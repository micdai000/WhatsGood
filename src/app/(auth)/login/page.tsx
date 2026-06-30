import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { LoadingState } from "@/components/layout/loading-state";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <LoginForm />
    </Suspense>
  );
}
