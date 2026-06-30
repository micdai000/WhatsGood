import { cn } from "@/lib/utils";
import { Caption } from "@/components/typography/typography";
import { LIMITS } from "@/lib/constants";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

type Strength = "weak" | "fair" | "good" | "strong";

function getStrength(password: string): Strength {
  if (password.length < LIMITS.PASSWORD_MIN_LENGTH) return "weak";

  let score = 0;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;

  if (score <= 2) return "fair";
  if (score === 3) return "good";
  return "strong";
}

const strengthConfig: Record<
  Strength,
  { label: string; bars: number; color: string }
> = {
  weak: { label: "Weak", bars: 1, color: "bg-destructive" },
  fair: { label: "Fair", bars: 2, color: "bg-warning" },
  good: { label: "Good", bars: 3, color: "bg-primary/70" },
  strong: { label: "Strong", bars: 4, color: "bg-success" },
};

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const strength = getStrength(password);
  const config = strengthConfig[strength];

  return (
    <div className={cn("space-y-2", className)} aria-live="polite">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full bg-muted",
              index < config.bars && config.color,
            )}
          />
        ))}
      </div>
      <Caption>Password strength: {config.label}</Caption>
    </div>
  );
}
