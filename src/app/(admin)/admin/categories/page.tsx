import { useState } from "react";
import { AdminEmptyState } from "@/components/admin";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Muted, Paragraph } from "@/components/typography/typography";
import { Spinner } from "@/components/ui/spinner";
import { useServiceQuery } from "@/hooks/use-service-query";
import { isOtherCategory, sortCategoriesForSelect } from "@/lib/business/categories";
import { adminBusinessService } from "@/services/admin";
import { isFailure } from "@/types";
import type { BusinessCategory } from "@/types";

export default function AdminCategoriesPage() {
  const [version, setVersion] = useState(0);
  const refresh = () => setVersion((value) => value + 1);
  const result = useServiceQuery(() => adminBusinessService.listCategories(), [version]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Business categories</h2>
          <Muted className="text-sm">
            The category list shown when creating or editing a business, and in
            search filters.
          </Muted>
        </div>
        <CategoryFormDialog onSaved={refresh} />
      </div>

      {result.status === "loading" ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : result.status === "error" ? (
        <Paragraph className="text-destructive">{result.message}</Paragraph>
      ) : result.data.length === 0 ? (
        <AdminEmptyState
          title="No categories"
          description="Add the first business category."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium" scope="col">Name</th>
                <th className="px-4 py-3 font-medium" scope="col">Slug</th>
                <th className="px-4 py-3 font-medium" scope="col">Status</th>
                <th className="px-4 py-3 font-medium" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortCategoriesForSelect(result.data).map((category) => (
                <CategoryRow key={category.id} category={category} onChanged={refresh} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CategoryRow({
  category,
  onChanged,
}: {
  category: BusinessCategory;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleActive() {
    setBusy(true);
    setError(null);
    const result = await adminBusinessService.setCategoryActive(
      category.id,
      !category.isActive,
    );
    setBusy(false);
    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }
    onChanged();
  }

  return (
    <tr className="border-b align-top last:border-0">
      <td className="px-4 py-3">
        <p className="font-medium">{category.name}</p>
        {category.description ? (
          <Muted className="text-xs">{category.description}</Muted>
        ) : null}
        {isOtherCategory(category) ? (
          <Muted className="text-xs">Lets businesses type their own category.</Muted>
        ) : null}
        {error ? (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </td>
      <td className="px-4 py-3">
        <Muted>{category.slug}</Muted>
      </td>
      <td className="px-4 py-3">
        <Badge variant={category.isActive ? "secondary" : "outline"}>
          {category.isActive ? "Active" : "Disabled"}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <CategoryFormDialog category={category} onSaved={onChanged} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void toggleActive()}
          >
            {busy ? "Saving…" : category.isActive ? "Disable" : "Enable"}
            <span className="sr-only"> {category.name}</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}
