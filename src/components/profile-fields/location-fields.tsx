import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface LocationFieldsProps {
  city: string;
  state: string;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  errors?: { city?: string; state?: string };
  className?: string;
}

export function LocationFields({
  city,
  state,
  onCityChange,
  onStateChange,
  errors,
  className,
}: LocationFieldsProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          name="city"
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
          autoComplete="address-level2"
          aria-invalid={Boolean(errors?.city)}
          aria-describedby={errors?.city ? "city-error" : undefined}
        />
        {errors?.city ? (
          <p id="city-error" className="text-sm text-destructive" role="alert">
            {errors.city}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="state">State</Label>
        <Input
          id="state"
          name="state"
          value={state}
          onChange={(event) => onStateChange(event.target.value)}
          autoComplete="address-level1"
          aria-invalid={Boolean(errors?.state)}
          aria-describedby={errors?.state ? "state-error" : undefined}
        />
        {errors?.state ? (
          <p id="state-error" className="text-sm text-destructive" role="alert">
            {errors.state}
          </p>
        ) : null}
      </div>
    </div>
  );
}
