import { Link } from "react-router-dom";
import { UserX } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageTitle, Muted, Paragraph } from "@/components/typography/typography";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProfileNotFound() {
  return (
    <Section>
      <Container size="narrow">
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UserX className="size-7" aria-hidden />
          </div>
          <PageTitle as="h1">Profile not found</PageTitle>
          <Paragraph className="mt-3 max-w-md text-muted-foreground">
            We couldn&apos;t find a professional profile at this address. The
            username may be incorrect, or the profile may have been removed.
          </Paragraph>
          <Muted className="mt-2 text-sm">
            Double-check the link you were given, including the username.
          </Muted>
          <Link
            to="/search"
            className={cn(buttonVariants({ variant: "outline" }), "mt-8")}
          >
            Browse professionals
          </Link>
        </div>
      </Container>
    </Section>
  );
}
