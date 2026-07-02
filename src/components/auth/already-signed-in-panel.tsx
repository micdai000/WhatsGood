"use client";

import { useTransition } from "react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import {
  signOutAction,
  signOutToSignupAction,
} from "@/app/actions/auth.actions";
import { AuthCard } from "@/components/auth/auth-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Muted, Paragraph } from "@/components/typography/typography";
import { cn } from "@/lib/utils";

interface AlreadySignedInPanelProps {
  email: string;
  continueHref: string;
  continueLabel?: string;
  mode: "login" | "signup";
}

export function AlreadySignedInPanel({
  email,
  continueHref,
  continueLabel = "Continue to Dashboard",
  mode,
}: AlreadySignedInPanelProps) {
  const [pending, startTransition] = useTransition();

  function handleSignOut(redirect: "login" | "signup") {
    startTransition(async () => {
      if (redirect === "signup") {
        await signOutToSignupAction();
      } else {
        await signOutAction();
      }
    });
  }

  return (
    <AuthCard
      title="You are already signed in"
      description={
        mode === "login"
          ? "Continue with this account or switch to a different one."
          : "Continue with this account or sign out to create another."
      }
    >
      <div className="space-y-6">
        <div className="rounded-lg border bg-muted/30 px-4 py-3 text-center">
          <Muted className="text-xs uppercase tracking-wide">Signed in as</Muted>
          <Paragraph className="mt-1 break-all font-medium">{email}</Paragraph>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href={continueHref}
            className={cn(buttonVariants({ variant: "default" }), "w-full")}
          >
            {continueLabel}
          </Link>

          {mode === "login" ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={pending}
                onClick={() => handleSignOut("login")}
              >
                <LogOut className="size-4" aria-hidden />
                {pending ? "Signing out…" : "Sign out"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={pending}
                onClick={() => handleSignOut("login")}
              >
                <UserRound className="size-4" aria-hidden />
                {pending ? "Signing out…" : "Use another account"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={pending}
              onClick={() => handleSignOut("signup")}
            >
              <LogOut className="size-4" aria-hidden />
              {pending ? "Signing out…" : "Sign out & create another account"}
            </Button>
          )}
        </div>
      </div>
    </AuthCard>
  );
}
