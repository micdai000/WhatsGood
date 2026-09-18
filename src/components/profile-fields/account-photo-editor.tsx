import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { uploadProfilePhotoAction } from "@/app/actions/onboarding.actions";
import { AppImage } from "@/components/ui/app-image";
import { Button } from "@/components/ui/button";
import { Muted } from "@/components/typography/typography";
import { getInitials } from "@/lib/auth/display-name";
import { cn } from "@/lib/utils";

interface AccountPhotoEditorProps {
  value: string | null;
  displayName: string;
  onChange: (url: string | null) => Promise<void> | void;
  className?: string;
}

export function AccountPhotoEditor({
  value,
  displayName,
  onChange,
  className,
}: AccountPhotoEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(file: File | null) {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("photo", file);

      const result = await uploadProfilePhotoAction(formData);

      if (!result.success) {
        setError(result.message);
        return;
      }

      await onChange(result.data.url);
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message
          ? caught.message
          : "Couldn't upload that photo. Try a JPEG, PNG, WebP, or GIF under 5 MB.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setUploading(true);
    setError(null);

    try {
      await onChange(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message
          ? caught.message
          : "Couldn't remove that photo. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  function openPicker() {
    inputRef.current?.click();
  }

  const initials = getInitials(displayName) || displayName.charAt(0).toUpperCase() || "?";

  return (
    <div className={cn("flex flex-col gap-5 sm:flex-row sm:items-center", className)}>
      <div className="relative mx-auto size-24 shrink-0 sm:mx-0">
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          className="relative size-24 overflow-hidden rounded-full border border-border bg-muted outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70"
          aria-label={value ? "Change profile photo" : "Add a profile photo"}
        >
          {value ? (
            <AppImage
              src={value}
              alt={`${displayName} profile photo`}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="flex size-full items-center justify-center text-2xl font-semibold text-muted-foreground">
              {initials}
            </span>
          )}
          {uploading ? (
            <span className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="size-5 animate-spin" aria-hidden />
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          className="absolute right-0 bottom-0 inline-flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70"
          aria-label={value ? "Change profile photo" : "Add a profile photo"}
        >
          <Camera className="size-3.5" aria-hidden />
        </button>
      </div>

      <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
        <div className="space-y-0.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Your name
          </p>
          <p className="truncate text-lg font-semibold tracking-tight">{displayName}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={openPicker}
          >
            {uploading ? "Uploading…" : value ? "Change photo" : "Add a photo"}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => void handleRemove()}
            >
              Remove
            </Button>
          ) : null}
        </div>

        <Muted className="text-xs">
          JPEG, PNG, WebP, or GIF. Max 5 MB.
        </Muted>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        id="account-photo"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          void handleFileChange(file);
        }}
      />
    </div>
  );
}
