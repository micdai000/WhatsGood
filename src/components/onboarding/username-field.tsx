"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { checkSlugAvailabilityAction } from "@/app/actions/onboarding.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Muted } from "@/components/typography/typography";
import { sanitizeSlug } from "@/lib/utils/slug";
import { cn } from "@/lib/utils";

interface UsernameFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

type AvailabilityState =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid"
  | "error";

export function UsernameField({ value, onChange, error }: UsernameFieldProps) {
  const [availability, setAvailability] = useState<AvailabilityState>("idle");
  const [availabilityMessage, setAvailabilityMessage] = useState<string>("");

  useEffect(() => {
    const slug = value.trim();

    if (!slug) {
      setAvailability("idle");
      setAvailabilityMessage("");
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setAvailability("invalid");
      setAvailabilityMessage(
        "Use lowercase letters, numbers, and hyphens only.",
      );
      return;
    }

    setAvailability("checking");
    setAvailabilityMessage("Checking availability…");

    const timeout = window.setTimeout(async () => {
      const result = await checkSlugAvailabilityAction(slug);

      if (!result.success) {
        setAvailability("error");
        setAvailabilityMessage(result.message);
        return;
      }

      if (result.data.available) {
        setAvailability("available");
        setAvailabilityMessage("Username is available.");
      } else {
        setAvailability("taken");
        setAvailabilityMessage("This username is already taken.");
      }
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [value]);

  const showStatus = value.trim().length > 0;

  return (
    <div className="space-y-2">
      <Label htmlFor="username">Username</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          @
        </span>
        <Input
          id="username"
          name="username"
          value={value}
          onChange={(event) => onChange(sanitizeSlug(event.target.value))}
          className="pl-7"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(error) || availability === "taken"}
          aria-describedby="username-hint username-status"
        />
      </div>
      <Muted id="username-hint">
        Your public profile URL will be trustloop.app/@{value || "username"}
      </Muted>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {showStatus ? (
        <p
          id="username-status"
          className={cn(
            "flex items-center gap-1.5 text-sm",
            availability === "available" && "text-emerald-600 dark:text-emerald-400",
            (availability === "taken" || availability === "invalid") &&
              "text-destructive",
            availability === "checking" && "text-muted-foreground",
            availability === "error" && "text-destructive",
          )}
          role="status"
        >
          {availability === "checking" ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : availability === "available" ? (
            <Check className="size-3.5" aria-hidden />
          ) : availability === "taken" || availability === "invalid" ? (
            <X className="size-3.5" aria-hidden />
          ) : null}
          {availabilityMessage}
        </p>
      ) : null}
    </div>
  );
}
