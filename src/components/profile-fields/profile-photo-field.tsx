import { useRef, useState } from "react";
import { AppImage } from "@/components/ui/app-image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { uploadProfilePhotoAction } from "@/app/actions/onboarding.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Muted } from "@/components/typography/typography";
import { cn } from "@/lib/utils";

interface ProfilePhotoFieldProps {
  value: string | null;
  onChange: (url: string | null) => void;
  displayName?: string;
  className?: string;
}

export function ProfilePhotoField({
  value,
  onChange,
  displayName = "Profile",
  className,
}: ProfilePhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    onChange(result.data.url);
  }

  function handleRemove() {
    onChange(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const initials = displayName.charAt(0).toUpperCase() || "?";

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-muted/20 p-6">
        {value ? (
          <div className="relative size-32 overflow-hidden rounded-full border border-border">
            <AppImage
              src={value}
              alt={`${displayName} profile photo preview`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div
            className="flex size-32 items-center justify-center rounded-full bg-muted text-2xl font-medium text-muted-foreground"
            aria-hidden
          >
            {initials}
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
            ) : value ? (
              "Replace photo"
            ) : (
              <>
                <ImagePlus className="size-4" aria-hidden />
                Upload photo
              </>
            )}
          </Button>
          {value ? (
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
  );
}
