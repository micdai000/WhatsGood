import { profileSearchSchema } from "@/lib/validators/profile-search";
import type { ProfileSearchParams } from "@/types";

export function parseProfileSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ProfileSearchParams {
  const raw = {
    query: getParam(searchParams, "q"),
    professionId: getParam(searchParams, "profession"),
    city: getParam(searchParams, "city"),
    state: getParam(searchParams, "state"),
    sort: getParam(searchParams, "sort"),
    page: getParam(searchParams, "page"),
    limit: getParam(searchParams, "limit"),
  };

  return profileSearchSchema.parse(raw);
}

export function buildSearchUrl(
  pathname: string,
  params: ProfileSearchParams,
): string {
  const searchParams = new URLSearchParams();

  if (params.query) searchParams.set("q", params.query);
  if (params.professionId) searchParams.set("profession", params.professionId);
  if (params.city) searchParams.set("city", params.city);
  if (params.state) searchParams.set("state", params.state);
  if (params.sort && params.sort !== "newest") {
    searchParams.set("sort", params.sort);
  }
  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0];
  return value;
}
