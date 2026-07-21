import { useMemo } from "react";
import { PROFESSIONS_DISCOVERY_COPY } from "@/lib/professions/display";
import { useSearchParams } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import {
  EmptyResults,
  FilterPanel,
  ResultsGrid,
  SearchForm,
  SearchPagination,
  SortDropdown,
} from "@/components/search";
import { Spinner } from "@/components/ui/spinner";
import { useServiceQuery } from "@/hooks/use-service-query";
import { parseProfileSearchParams } from "@/lib/search/params";
import { profileService } from "@/services/profiles/profile.service";
import { professionService } from "@/services/professions/profession.service";

function searchParamsToRecord(
  searchParams: URLSearchParams,
): Record<string, string | string[] | undefined> {
  const record: Record<string, string | string[] | undefined> = {};
  searchParams.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const params = useMemo(
    () => parseProfileSearchParams(searchParamsToRecord(searchParams)),
    [searchParams],
  );

  const searchResult = useServiceQuery(
    () => profileService.searchProfiles(params),
    [
      params.query,
      params.professionId,
      params.city,
      params.state,
      params.sort,
      params.page,
      params.limit,
    ],
  );

  const professionsResult = useServiceQuery(
    () => professionService.getProfessions(),
    [],
  );

  if (
    searchResult.status === "loading" ||
    professionsResult.status === "loading"
  ) {
    return (
      <Section spacing="default">
        <Container className="space-y-6">
          <PageHeader
            title="Find professionals"
            description={`Discover trusted professionals in ${PROFESSIONS_DISCOVERY_COPY} on Meritt Pros.`}
          />
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        </Container>
      </Section>
    );
  }

  if (searchResult.status === "error") {
    throw new Error(searchResult.message);
  }

  const professions =
    professionsResult.status === "success" ? professionsResult.data : [];
  const results = searchResult.data;
  const hasActiveFilters = Boolean(
    params.query || params.professionId || params.city || params.state,
  );

  return (
    <Section spacing="default">
      <Container className="space-y-6">
        <PageHeader
          title="Find professionals"
          description={`Discover trusted professionals in ${PROFESSIONS_DISCOVERY_COPY} on Meritt Pros.`}
        />

        <SearchForm params={params} />

        <FilterPanel params={params} professions={professions} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {results.total === 0
              ? "No results"
              : `${results.total} professional${results.total === 1 ? "" : "s"} found`}
          </p>
          <SortDropdown params={params} />
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
