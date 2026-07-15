import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { H1, Muted, Paragraph } from "@/components/typography/typography";

export function HomeHero() {
  return (
    <Section spacing="tight" className="pb-6 pt-8 sm:pt-10">
      <Container className="space-y-6">
        <div className="max-w-2xl space-y-3">
          <H1>Build trust through verified reviews</H1>
          <Paragraph className="text-muted-foreground">
            Meritt helps independent professionals collect authentic
            feedback, showcase their reputation, and grow with confidence.
          </Paragraph>
          <Muted>
            What people believe is worth choosing.
          </Muted>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/auth/signup" className={buttonVariants()}>
            Get started free
          </Link>
          <Link
            to="/search"
            className={buttonVariants({ variant: "outline" })}
          >
            Explore professionals
          </Link>
        </div>
      </Container>
    </Section>
  );
}
