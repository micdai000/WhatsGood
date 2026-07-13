import { useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
import {
  adminCreateProfessionAction,
  adminUpdateProfessionAction,
} from "@/app/actions/admin.actions";
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
import { sanitizeSlug } from "@/lib/utils/slug";
import type { Profession } from "@/types";

interface ProfessionFormDialogProps {
  profession?: Profession;
  triggerLabel?: string;
}

export function ProfessionFormDialog({
  profession,
  triggerLabel,
}: ProfessionFormDialogProps) {
  const isEdit = Boolean(profession);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant={isEdit ? "outline" : "default"} size="sm">
            {isEdit ? (
              triggerLabel ?? "Edit"
            ) : (
              <>
                <Plus className="size-4" aria-hidden />
                Add profession
              </>
            )}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit profession" : "Create profession"}</DialogTitle>
          <DialogDescription>
            Profession names must be unique. Disabled professions are hidden from onboarding.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            const formData = new FormData(event.currentTarget);

            startTransition(async () => {
              const payload = {
                name: String(formData.get("name") ?? "").trim(),
                slug: sanitizeSlug(String(formData.get("slug") ?? "")),
                icon: String(formData.get("icon") ?? "").trim() || null,
              };

              const result = isEdit
                ? await adminUpdateProfessionAction(profession!.id, payload)
                : await adminCreateProfessionAction(payload);

              if (!result.success) {
                setError(result.message);
                return;
              }

              setOpen(false);
              navigate(0);
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="profession-name">Name</Label>
            <Input
              id="profession-name"
              name="name"
              defaultValue={profession?.name ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profession-slug">Slug</Label>
            <Input
              id="profession-slug"
              name="slug"
              defaultValue={profession?.slug ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profession-icon">Icon (optional)</Label>
            <Input
              id="profession-icon"
              name="icon"
              defaultValue={profession?.icon ?? ""}
              placeholder="briefcase"
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create profession"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
