import { Link } from "react-router-dom";
import { PRO_SIGNUP_ROUTE } from "@/lib/auth/routes";
import { PROFESSIONS_DISCOVERY_COPY } from "@/lib/professions/display";
import { Search, UserRound } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ResultsGrid } from "@/components/search";
import { Spinner } from "@/components/ui/spinner";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { Eyebrow, H1, Muted } from "@/components/typography/typography";
import { MerittSection } from "@/components/ui/meritt-surface";
import { useServiceQuery } from "@/hooks/use-service-query";
import { profileService } from "@/services/profiles/profile.service";

export default function HomePage() {
  const featured = useServiceQuery(
    () =>
      profileService.searchProfiles({
        page: 1,
        limit: 6,
        sort: "rating",
      }),
    [],
  );

  return (
    <PageWrapper>
      <Section spacing="loose" className="pb-10 pt-24 sm:pt-28">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div className="max-w-xl space-y-5">
              <Eyebrow>For independent professionals</Eyebrow>
              <H1>Meritt Pros</H1>
              <Muted className="text-base leading-relaxed">
                Find trusted professionals in {PROFESSIONS_DISCOVERY_COPY} —
                backed by verified reviews from real clients.
              </Muted>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link to="/search" className={buttonVariants({ size: "lg" })}>
                  <Search className="size-4" aria-hidden />
                  Browse professionals
                </Link>
                <Link
                  to={PRO_SIGNUP_ROUTE}
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  <UserRound className="size-4" aria-hidden />
                  Join as a pro
                </Link>
              </div>
            </div>

            <div className="meritt-card p-4">
              <div className="meritt-panel space-y-3">
                <Eyebrow>How it works</Eyebrow>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">1. Search</span>{" "}
                    — filter by profession, city, and rating.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">2. Compare</span>{" "}
                    — read verified reviews on each profile.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">3. Choose</span>{" "}
                    — connect with the professional you trust.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <MerittSection variant="white" className="py-14 sm:py-16">
        <Container className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Featured</Eyebrow>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Top professionals
              </h2>
              <Muted className="mt-1">
                Highly rated pros on Meritt Pros right now.
              </Muted>
            </div>
            <Link
              to="/search"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              View all
            </Link>
          </div>

          {featured.status === "loading" ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : featured.status === "success" && featured.data.items.length > 0 ? (
            <ResultsGrid profiles={featured.data.items} />
          ) : (
            <div className="meritt-panel text-center text-sm text-muted-foreground">
              No professionals to show yet.{" "}
              <Link to={PRO_SIGNUP_ROUTE} className="font-medium text-foreground underline">
                Be the first to join
              </Link>
              .
            </div>
          )}
        </Container>
      </MerittSection>
    </PageWrapper>
  );
}
