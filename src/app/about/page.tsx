import { Link } from "react-router-dom";
import { MapPin, QrCode, Search } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { Eyebrow, H1, H2, Muted, Paragraph } from "@/components/typography/typography";
import { MerittSection } from "@/components/ui/meritt-surface";
import { buttonVariants } from "@/components/ui/button";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { PRO_SIGNUP_ROUTE } from "@/lib/auth/routes";
import { HOME_HOW_IT_WORKS_STEPS, HOME_PRIMARY_CTA, HOME_PRO_CTA } from "@/lib/home/marketing-copy";
import { getCanonicalUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";

const BUSINESS_CATEGORIES = [
  "Automotive",
  "Barber",
  "Beauty & Personal Care",
  "Construction & Home Services",
  "Education & Coaching",
  "Food & Dining",
  "Health & Wellness",
  "Hotel",
  "Photography & Creative",
  "Professional Services",
  "Retail",
  "Technology",
  "Other",
] as const;

const REPUTATION_TIERS = ["Building", "Bronze", "Silver", "Gold", "Elite"] as const;

export default function AboutPage() {
  useDocumentMeta({
    title: `About ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    url: getCanonicalUrl("/about"),
  });

  return (
    <PageWrapper>
      <Section spacing="loose" className="pb-12 pt-24 sm:pb-16 sm:pt-28">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div className="max-w-2xl space-y-6">
              <Eyebrow>About {SITE_NAME}</Eyebrow>
              <H1>Current reputation for the businesses people choose today.</H1>
              <Paragraph className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {SITE_NAME} shows how a business is doing now. Reputation comes
                from recent customer feedback, so an old review does not define
                a business forever.
              </Paragraph>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/search" className={buttonVariants({ size: "lg" })}>
                  <Search className="size-4" aria-hidden />
                  {HOME_PRIMARY_CTA}
                </Link>
                <Link
                  to={PRO_SIGNUP_ROUTE}
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  {HOME_PRO_CTA}
                </Link>
              </div>
            </div>

            <div className="meritt-card p-6 sm:p-8">
              <div className="meritt-panel space-y-4">
                <Eyebrow>On a business page</Eyebrow>
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  See the reputation, then share your own experience.
                </p>
                <Muted className="text-base leading-relaxed">
                  Each public page shows the current reputation, the number of
                  customer feedback submissions, and a way to give feedback
                  after a visit.
                </Muted>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <MerittSection variant="white" className="py-16 sm:py-24">
        <Container className="space-y-10">
          <div className="max-w-3xl space-y-4">
            <Eyebrow>For people looking</Eyebrow>
            <H2>Search, compare, and choose from how a business is doing now.</H2>
            <Paragraph className="text-lg text-muted-foreground">
              Pick a category and a location. Results lead with current
              reputation, then open a business page to read the latest customer
              feedback before you decide.
            </Paragraph>
          </div>

          <ol className="grid gap-4 md:grid-cols-3">
            {HOME_HOW_IT_WORKS_STEPS.map((step, index) => (
              <li key={step.title} className="meritt-card flex h-full flex-col gap-3 p-6 sm:p-8">
                <Eyebrow>{String(index + 1).padStart(2, "0")}</Eyebrow>
                <h3 className="text-2xl font-semibold tracking-tight">{step.title}</h3>
                <Muted className="text-base leading-relaxed">{step.description}</Muted>
              </li>
            ))}
          </ol>
        </Container>
      </MerittSection>

      <Section spacing="loose">
        <Container className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <article className="meritt-card space-y-5 p-6 sm:p-10">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MapPin className="size-5" aria-hidden />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Find a business you can check today.
            </h2>
            <Paragraph className="text-muted-foreground">
              Browse automotive shops, restaurants, hotels, home services,
              professional firms, and more. Every listing shows where the
              business is and how customers have responded recently.
            </Paragraph>
            <Link to="/search" className={buttonVariants({ variant: "outline" })}>
              {HOME_PRIMARY_CTA}
            </Link>
          </article>

          <article className="meritt-card space-y-5 p-6 sm:p-10">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <QrCode className="size-5" aria-hidden />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Build a reputation customers can see.
            </h2>
            <Paragraph className="text-muted-foreground">
              Create your business page and put a Meritt QR code where customers
              can scan it. Their feedback updates the public count on your page,
              in search, and on the homepage.
            </Paragraph>
            <Link to={PRO_SIGNUP_ROUTE} className={buttonVariants({ variant: "outline" })}>
              {HOME_PRO_CTA}
            </Link>
          </article>
        </Container>
      </Section>

      <MerittSection variant="surface" className="py-16 sm:py-24">
        <Container className="space-y-10">
          <div className="max-w-3xl space-y-4">
            <Eyebrow>Current reputation</Eyebrow>
            <H2>Recent feedback carries the reputation.</H2>
            <Paragraph className="text-lg text-muted-foreground">
              A new business starts at Building reputation. Feedback is saved so
              current standing can eventually move through Bronze, Silver, Gold,
              and Elite. The point is what is happening now, not a lifetime
              average.
            </Paragraph>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {REPUTATION_TIERS.map((tier) => (
              <li
                key={tier}
                className="meritt-card flex min-h-28 items-end p-5 text-lg font-semibold tracking-tight sm:min-h-32 sm:p-6 sm:text-xl"
              >
                {tier}
              </li>
            ))}
          </ul>
        </Container>
      </MerittSection>

      <Section spacing="loose" className="pb-20 sm:pb-28">
        <Container className="space-y-8">
          <div className="max-w-3xl space-y-4">
            <Eyebrow>Categories</Eyebrow>
            <H2>Businesses across the work people hire for.</H2>
            <Paragraph className="text-lg text-muted-foreground">
              Search is organized by the same categories you see when you look
              for a business.
            </Paragraph>
          </div>
          <ul className="flex flex-wrap gap-3">
            {BUSINESS_CATEGORIES.map((category) => (
              <li
                key={category}
                className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm"
              >
                {category}
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </PageWrapper>
  );
}
