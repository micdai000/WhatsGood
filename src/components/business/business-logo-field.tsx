import { useRef, useState } from "react";
import { AppImage } from "@/components/ui/app-image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Muted } from "@/components/typography/typography";
import { businessService } from "@/services/businesses";
import { isFailure } from "@/types";

interface BusinessLogoFieldProps {
  id?: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
}

export function BusinessLogoField({
  id = "business-logo",
  value,
  onChange,
  disabled = false,
  onUploadingChange,
}: BusinessLogoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(file: File | null) {
    if (!file) return;

    setUploading(true);
    onUploadingChange?.(true);
    setError(null);

    const result = await businessService.uploadLogo(file);

    setUploading(false);
    onUploadingChange?.(false);

    if (isFailure(result)) {
      setError(result.error.message);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    onChange(result.data.url);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Logo</Label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border">
            <AppImage src={value} alt="Business logo preview" fill unoptimized />
          </div>
        ) : null}
        <Input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={disabled || uploading}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            void handleFileChange(file);
          }}
        />
      </div>
      <Muted className="text-xs">
        {uploading ? "Uploading…" : "Choose an image from your files. JPEG, PNG, WebP, or GIF. Max 5 MB."}
      </Muted>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
