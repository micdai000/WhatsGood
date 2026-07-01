"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import {
  createProfileAction,
  getProfessionsAction,
} from "@/app/actions/onboarding.actions";
import { OnboardingWizardShell } from "@/components/onboarding/onboarding-wizard-shell";
import { buttonVariants } from "@/components/ui/button";
import { Muted, Paragraph } from "@/components/typography/typography";
import { ONBOARDING_ROUTES } from "@/lib/onboarding/constants";
import { toCreateProfileInput } from "@/lib/onboarding/wizard-state";
import {
  clearOnboardingStorage,
  useOnboardingWizard,
} from "@/hooks/use-onboarding-wizard";
import { getSiteUrl } from "@/lib/auth/routes";
import { cn } from "@/lib/utils";

const EDIT_LINKS = [
  { label: "Profession", href: ONBOARDING_ROUTES.profession, key: "profession" },
  { label: "Display name", href: ONBOARDING_ROUTES.name, key: "name" },
  { label: "Username", href: ONBOARDING_ROUTES.username, key: "username" },
  { label: "Bio", href: ONBOARDING_ROUTES.bio, key: "bio" },
  { label: "Photo", href: ONBOARDING_ROUTES.photo, key: "photo" },
  { label: "Location", href: ONBOARDING_ROUTES.location, key: "location" },
] as const;

export function ReviewStep() {
  const router = useRouter();
  const { state, isReady } = useOnboardingWizard();
  const [professionName, setProfessionName] = useState<string>("—");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.professionId) return;

    getProfessionsAction().then((result) => {
      if (!result.success) return;
      const match = result.data.find((p) => p.id === state.professionId);
      if (match) setProfessionName(match.name);
    });
  }, [state.professionId]);

  if (!isReady) return null;

  const publicUrl = `${getSiteUrl()}/@${state.slug}`;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const result = await createProfileAction(toCreateProfileInput(state));

    if (!result.success) {
      setSubmitting(false);
      setError(result.message);
      return;
    }

    clearOnboardingStorage();
    router.replace(ONBOARDING_ROUTES.dashboard);
  }

  return (
    <OnboardingWizardShell
      title="Review your profile"
      description="Make sure everything looks right before publishing."
      continueLabel="Create My Profile"
      continueDisabled={submitting}
      onContinue={async () => {
        await handleSubmit();
        return false;
      }}
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4 rounded-lg border border-border bg-muted/20 p-4">
          {state.profilePhotoUrl ? (
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-border">
              <Image
                src={state.profilePhotoUrl}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
              {state.fullName.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <div className="min-w-0 space-y-1">
            <Paragraph className="font-medium">{state.fullName}</Paragraph>
            <Muted>@{state.slug}</Muted>
            <Muted>
              {professionName} · {state.city}, {state.state}
            </Muted>
          </div>
        </div>

        {state.bio ? (
          <div className="space-y-1">
            <Muted className="text-xs uppercase tracking-wide">Bio</Muted>
            <Paragraph className="text-sm text-muted-foreground">{state.bio}</Paragraph>
          </div>
        ) : null}

        <div className="space-y-1">
          <Muted className="text-xs uppercase tracking-wide">Public URL</Muted>
          <Paragraph className="break-all text-sm">{publicUrl}</Paragraph>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {EDIT_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5",
              )}
            >
              <Pencil className="size-3.5" aria-hidden />
              Edit {link.label}
            </Link>
          ))}
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {submitting ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Creating your profile…
          </div>
        ) : null}
      </div>
    </OnboardingWizardShell>
  );
}
