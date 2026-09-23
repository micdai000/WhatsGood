import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { Muted } from "@/components/typography/typography";
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
import {
  SEARCH_PAGE_SUBTITLE,
  SEARCH_PAGE_TITLE,
} from "@/lib/search/discovery-copy";
import { businessService } from "@/services/businesses";

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
    () => businessService.discoverBusinesses(params),
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

  const categoriesResult = useServiceQuery(
    () => businessService.getCategories(),
    [],
  );

  const pageHeader = (
    <PageHeader title={SEARCH_PAGE_TITLE} description={SEARCH_PAGE_SUBTITLE} />
  );

  if (
    searchResult.status === "loading" ||
    categoriesResult.status === "loading"
  ) {
    return (
      <Section spacing="default">
        <Container className="space-y-6">
          {pageHeader}
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

  const categories =
    categoriesResult.status === "success" ? categoriesResult.data : [];
  const results = searchResult.data;
  const hasActiveFilters = Boolean(
    params.query || params.professionId || params.city || params.state,
  );

  return (
    <Section spacing="default">
      <Container className="space-y-6">
        {pageHeader}

        <FilterPanel params={params} professions={categories} />

        <SearchForm params={params} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {results.total === 0 ? (
              "No results"
            ) : (
              <>
                <span className="font-medium text-foreground">{results.total}</span>{" "}
                business{results.total === 1 ? "" : "es"} with current reputation
              </>
            )}
          </p>
          <SortDropdown params={params} />
        </div>

        {results.items.length > 0 ? (
          <>
            <ResultsGrid businesses={results.items} />
            <SearchPagination result={results} params={params} />
          </>
        ) : (
          <EmptyResults hasFilters={hasActiveFilters} />
        )}

        <Muted className="text-center text-xs">
          Results show current tier first — updated monthly from recent client feedback.
        </Muted>
      </Container>
    </Section>
  );
}
