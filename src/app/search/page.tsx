import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import {
  EmptyResults,
  FilterPanel,
  LoadingResults,
  ResultsGrid,
  SearchForm,
  SearchPagination,
  SortDropdown,
} from "@/components/search";
import { parseProfileSearchParams } from "@/lib/search/params";
import { profileService } from "@/services/profiles/profile.service";
import { professionService } from "@/services/professions/profession.service";
import { isFailure } from "@/types";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const params = parseProfileSearchParams(resolvedParams);

  const [searchResult, professionsResult] = await Promise.all([
    profileService.searchProfiles(params),
    professionService.getProfessions(),
  ]);

  if (isFailure(searchResult)) {
    throw new Error(searchResult.error.message);
  }

  const professions = isFailure(professionsResult) ? [] : professionsResult.data;
  const results = searchResult.data;
  const hasActiveFilters = Boolean(
    params.query || params.professionId || params.city || params.state,
  );

  return (
    <Section spacing="default">
      <Container className="space-y-6">
        <PageHeader
          title="Find professionals"
          description="Discover trusted tutors, coaches, consultants, and more on TrustLoop."
        />

        <Suspense fallback={<LoadingResults count={3} />}>
          <SearchForm params={params} />
        </Suspense>

        <Suspense fallback={null}>
          <FilterPanel params={params} professions={professions} />
        </Suspense>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {results.total === 0
              ? "No results"
              : `${results.total} professional${results.total === 1 ? "" : "s"} found`}
          </p>
          <Suspense fallback={null}>
            <SortDropdown params={params} />
          </Suspense>
        </div>

        {results.items.length > 0 ? (
          <>
            <ResultsGrid profiles={results.items} />
            <SearchPagination result={results} params={params} />
          </>
        ) : (
          <EmptyResults hasFilters={hasActiveFilters} />
        )}
      </Container>
    </Section>
  );
}
