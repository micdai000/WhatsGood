import { Link } from "react-router-dom";
import { PRO_SIGNUP_ROUTE } from "@/lib/auth/routes";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Eyebrow, H1, Muted } from "@/components/typography/typography";
import {
  HOME_HERO_EYEBROW,
  HOME_HERO_SUBTITLE,
  HOME_HERO_TITLE,
  HOME_PRIMARY_CTA,
  HOME_PRO_CTA,
} from "@/lib/home/marketing-copy";

export function HomeHero() {
  return (
    <Section spacing="tight" className="pb-6 pt-8 sm:pt-10">
      <Container className="space-y-6">
        <div className="max-w-2xl space-y-3">
          <Eyebrow>{HOME_HERO_EYEBROW}</Eyebrow>
          <H1>{HOME_HERO_TITLE}</H1>
          <Muted className="text-base leading-relaxed">{HOME_HERO_SUBTITLE}</Muted>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/search" className={buttonVariants({ size: "lg" })}>
            {HOME_PRIMARY_CTA}
          </Link>
          <Link
            to={PRO_SIGNUP_ROUTE}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {HOME_PRO_CTA}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
