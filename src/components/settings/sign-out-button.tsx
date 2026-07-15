import { useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const navigate = useNavigate();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await signOutAction();
          if (result.redirect) {
            navigate(result.redirect, { replace: true });
          }
        });
      }}
    >
      <LogOut className="size-4" aria-hidden />
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
