"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { uploadProfilePhotoAction } from "@/app/actions/onboarding.actions";
import { OnboardingWizardShell } from "@/components/onboarding/onboarding-wizard-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Muted } from "@/components/typography/typography";
import { useOnboardingWizard } from "@/hooks/use-onboarding-wizard";

export function PhotoStep() {
  const { state, updateState, isReady } = useOnboardingWizard();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isReady) return null;

  async function handleFileChange(file: File | null) {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.set("photo", file);

    const result = await uploadProfilePhotoAction(formData);

    setUploading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    updateState({ profilePhotoUrl: result.data.url });
  }

  function handleRemove() {
    updateState({ profilePhotoUrl: null });
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <OnboardingWizardShell
      title="Add a profile photo"
      description="A friendly photo helps clients connect with you. You can skip this for now."
      continueLabel={state.profilePhotoUrl ? "Continue" : "Skip for now"}
    >
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-muted/20 p-6">
          {state.profilePhotoUrl ? (
            <div className="relative size-32 overflow-hidden rounded-full border border-border">
              <Image
                src={state.profilePhotoUrl}
                alt="Profile photo preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex size-32 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ImagePlus className="size-8" aria-hidden />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Uploading…
                </>
              ) : state.profilePhotoUrl ? (
                "Replace photo"
              ) : (
                "Upload photo"
              )}
            </Button>
            {state.profilePhotoUrl ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleRemove}
                disabled={uploading}
              >
                <Trash2 className="size-4" aria-hidden />
                Remove
              </Button>
            ) : null}
          </div>

          <input
            ref={inputRef}
            id="profile-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              void handleFileChange(file);
            }}
          />

          <Muted className="text-center text-xs">
            JPEG, PNG, WebP, or GIF. Max 5 MB.
          </Muted>
        </div>

        <Label htmlFor="profile-photo" className="sr-only">
          Profile photo
        </Label>

        {error ? (
          <p className="text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </OnboardingWizardShell>
  );
}
