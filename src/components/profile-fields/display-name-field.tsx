import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DisplayNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export function DisplayNameField({
  value,
  onChange,
  error,
  className,
}: DisplayNameFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="fullName">Display name</Label>
      <Input
        id="fullName"
        name="fullName"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="name"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "fullName-error" : undefined}
      />
      {error ? (
        <p id="fullName-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
