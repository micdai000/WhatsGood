import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminBusinessService } from "@/services/admin";
import type { BusinessCategory } from "@/types";

export function CategoryFormDialog({
  category,
  onSaved,
}: {
  category?: BusinessCategory;
  onSaved: () => void;
}) {
  const isEdit = Boolean(category);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setName(category?.name ?? "");
      setDescription(category?.description ?? "");
      setError(null);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const result = await adminBusinessService.saveCategory(
      { name, description },
      category?.id,
    );
    setSaving(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    setOpen(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button type="button" variant={isEdit ? "outline" : "default"} size="sm">
            {isEdit ? (
              "Edit"
            ) : (
              <>
                <Plus className="size-4" aria-hidden />
                Add category
              </>
            )}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit category" : "Add a business category"}</DialogTitle>
          <DialogDescription>
            Categories appear in business onboarding, admin listings, and search
            filters. Disabled categories are hidden from new businesses but stay
            on businesses already using them.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-description">Description (optional)</Label>
            <Textarea
              id="category-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={saving || name.trim().length < 2}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Add category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
