import {
  AdminEmptyState,
  ProfessionFormDialog,
} from "@/components/admin";
import { DisableProfessionButton } from "@/components/admin/disable-profession-button";
import { Badge } from "@/components/ui/badge";
import { Muted, Paragraph } from "@/components/typography/typography";
import { adminService } from "@/services/admin";
import { isFailure } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminProfessionsPage() {
  const result = await adminService.getProfessions();

  if (isFailure(result)) {
    return <Paragraph className="text-destructive">{result.error.message}</Paragraph>;
  }

  const professions = result.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Professions</h2>
          <Muted className="text-sm">
            Manage profession categories used in onboarding and search.
          </Muted>
        </div>
        <ProfessionFormDialog />
      </div>

      {professions.length === 0 ? (
        <AdminEmptyState
          title="No professions"
          description="Create the first profession category."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium" scope="col">
                  Name
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Slug
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Status
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {professions.map((profession) => (
                <tr key={profession.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{profession.name}</td>
                  <td className="px-4 py-3">
                    <Muted>{profession.slug}</Muted>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={profession.isDisabled ? "outline" : "secondary"}>
                      {profession.isDisabled ? "Disabled" : "Active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <ProfessionFormDialog profession={profession} />
                      <DisableProfessionButton
                        id={profession.id}
                        isDisabled={profession.isDisabled}
                        name={profession.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
