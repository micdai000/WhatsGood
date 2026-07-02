"use client";

import { useEffect, useState } from "react";
import { getProfessionsAction } from "@/app/actions/onboarding.actions";
import { LoadingState } from "@/components/layout/loading-state";
import { ErrorState } from "@/components/layout/error-state";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Profession } from "@/types";
import { cn } from "@/lib/utils";

interface ProfessionFieldProps {
  value: string | null;
  onChange: (professionId: string) => void;
  error?: string;
  className?: string;
}

export function ProfessionField({
  value,
  onChange,
  error,
  className,
}: ProfessionFieldProps) {
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getProfessionsAction().then((result) => {
      if (!result.success) {
        setLoadError(result.message);
      } else {
        setProfessions(result.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingState label="Loading professions…" />;
  }

  if (loadError) {
    return (
      <ErrorState
        title="Unable to load professions"
        description={loadError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (professions.length === 0) {
    return (
      <ErrorState
        title="No professions available"
        description="Profession categories have not been set up yet. Apply database migrations or contact support."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <RadioGroup
        value={value ?? ""}
        onValueChange={onChange}
        className="grid gap-3"
        aria-label="Profession"
        aria-invalid={Boolean(error)}
      >
        {professions.map((profession) => (
          <Label
            key={profession.id}
            htmlFor={`profession-${profession.id}`}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
          >
            <RadioGroupItem
              value={profession.id}
              id={`profession-${profession.id}`}
            />
            <span className="font-medium">{profession.name}</span>
          </Label>
        ))}
      </RadioGroup>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
