import { TRUST_SIGNALS } from "@/lib/reviews/trust-signals";
import { cn } from "@/lib/utils";

interface TrustSignalInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
  error?: string | null;
}

const SIGNAL_STYLES = {
  promote: {
    selected: "border-violet-500 bg-violet-500/10 text-violet-950 dark:text-violet-100",
    idle: "hover:border-violet-500/40 hover:bg-violet-500/5",
  },
  maintain: {
    selected: "border-slate-500 bg-slate-500/10 text-slate-950 dark:text-slate-100",
    idle: "hover:border-slate-500/40 hover:bg-slate-500/5",
  },
  demote: {
    selected: "border-amber-600 bg-amber-500/10 text-amber-950 dark:text-amber-100",
    idle: "hover:border-amber-600/40 hover:bg-amber-500/5",
  },
} as const;

export function TrustSignalInput({
  value,
  onChange,
  disabled = false,
  className,
  error,
}: TrustSignalInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        role="radiogroup"
        aria-label="Trust signal"
        aria-invalid={Boolean(error)}
      >
        {TRUST_SIGNALS.map((option) => {
          const selected = value === option.value;
          const styles = SIGNAL_STYLES[option.signal];

          return (
            <button
              key={option.signal}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${option.label}. ${option.description}`}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                "min-h-[5.5rem] rounded-xl border px-4 py-4 text-left transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? cn(styles.selected, "shadow-sm")
                  : cn("border-border bg-background", styles.idle),
              )}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
