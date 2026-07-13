import { useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { deleteAccountAction } from "@/app/actions/auth.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Muted } from "@/components/typography/typography";

const CONFIRMATION_TEXT = "DELETE";

export function DeleteAccountDialog() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canDelete = confirmation === CONFIRMATION_TEXT;

  function handleDelete() {
    if (!canDelete) return;

    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteAccountAction();
        if (result.redirect) {
          navigate(result.redirect, { replace: true });
        } else if (!result.success) {
          setError("Unable to delete your account. Please try again.");
        }
      } catch {
        setError("Unable to delete your account. Please try again.");
      }
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setConfirmation("");
          setError(null);
        }
      }}
    >
      <AlertDialogTrigger
        render={
          <Button type="button" variant="destructive">
            Delete account
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes your profile, reviews, and review requests.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="delete-confirmation">
            Type <strong>{CONFIRMATION_TEXT}</strong> to confirm
          </Label>
          <Input
            id="delete-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            aria-describedby="delete-confirmation-hint"
          />
          <Muted id="delete-confirmation-hint" className="text-xs">
            Your account and all associated data will be permanently deleted.
          </Muted>
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!canDelete || pending}
            onClick={(event) => {
              event.preventDefault();
              handleDelete();
            }}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Deleting…
              </>
            ) : (
              "Delete account"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
