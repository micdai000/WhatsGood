"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
          router.refresh();
        });
      }}
    >
      {pending ? "Saving…" : isDisabled ? "Enable" : "Disable"}
      <span className="sr-only"> {name}</span>
    </Button>
  );
}
