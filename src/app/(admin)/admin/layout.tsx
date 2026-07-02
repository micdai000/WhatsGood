import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/authorization";
import { AdminShell } from "@/components/admin";
import { isFailure } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminResult = await requireAdmin();

  if (isFailure(adminResult)) {
    redirect("/dashboard");
  }

  return <AdminShell role={adminResult.data.role}>{children}</AdminShell>;
}
