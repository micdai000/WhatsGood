import { redirect } from "next/navigation";
import { authService } from "@/services/auth/auth.service";
import { AuthProvider } from "@/contexts/auth-context";
import { isSuccess } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await authService.getSession();

  if (!isSuccess(result) || !result.data) {
    redirect("/login");
  }

  return (
    <AuthProvider initialSession={result.data}>{children}</AuthProvider>
  );
}
