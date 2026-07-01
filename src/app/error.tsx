"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <Section>
      <Container className="py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          We hit an unexpected error. You can try again, or return to the home
          page if the problem persists.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={() => reset()}>
            Try again
          </Button>
          <Button type="button" variant="outline" onClick={() => { window.location.href = "/"; }}>
            Go home
          </Button>
        </div>
      </Container>
    </Section>
  );
}
