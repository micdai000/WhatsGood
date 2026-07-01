import { CharacterCounter } from "@/components/onboarding/character-counter";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LIMITS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface BioFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export function BioField({ value, onChange, error, className }: BioFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="bio">Bio (optional)</Label>
        <CharacterCounter value={value} maxLength={LIMITS.BIO_MAX_LENGTH} />
      </div>
      <Textarea
        id="bio"
        name="bio"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        maxLength={LIMITS.BIO_MAX_LENGTH}
        placeholder="I've helped students improve their math scores for over 10 years…"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "bio-error" : undefined}
      />
      {error ? (
        <p id="bio-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
