import { useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { adminUpdateProfessionAction } from "@/app/actions/admin.actions";
import { Button } from "@/components/ui/button";

interface DisableProfessionButtonProps {
  id: string;
  isDisabled: boolean;
  name: string;
}

export function DisableProfessionButton({
  id,
  isDisabled,
  name,
}: DisableProfessionButtonProps) {
  const navigate = useNavigate();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await adminUpdateProfessionAction(id, { isDisabled: !isDisabled });
          navigate(0);
        });
      }}
    >
      {pending ? "Saving…" : isDisabled ? "Enable" : "Disable"}
      <span className="sr-only"> {name}</span>
    </Button>
  );
}
