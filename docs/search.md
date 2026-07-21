# Search & Discovery

TrustLoop's search helps users **find independent professionals** by name, profession, and location — turning the platform from a collection of profiles into a browsable directory.

## Why search is essential

A professional directory only creates value when people can **discover** the right expert. Without search, profiles are invisible unless you already have a direct link. Search connects clients with detailers, photographers, tutors, home service pros, tech specialists, and other professionals based on what they need and where they are.

## Why search logic belongs in ProfileService

All profile data access flows through `ProfileService` because it:

1. **Validates parameters** with Zod before querying
2. **Centralizes filter/sort logic** in one place (`profile-search.query.ts`)
3. **Maps database rows** to typed `PublicProfile` results
4. **Logs queries** for debugging and future optimization
5. **Keeps React components thin** — no Supabase in the UI layer

Both `searchProfiles()` (public discovery) and `listProfiles()` (admin-style listing) share the same filter helpers to avoid duplicated logic.

## Why server-side search improves performance and security

| Server-side | Client-side |
|-------------|-------------|
| One paginated query per page load | Fetch all profiles, filter in browser |
| Filters applied in PostgreSQL with indexes | Large payloads, slow on mobile |
| Input validated before SQL | Raw user input in components |
| Only public fields returned | Risk of over-fetching |

The `/search` page is a **Server Component** that reads URL search params, calls `ProfileService.searchProfiles()`, and renders results. Interactive controls (filters, sort) update the URL; the server re-fetches on navigation.

## Architecture

```
/search?q=...&profession=...&city=...&state=...&sort=...&page=...
        │
        ▼
parseProfileSearchParams()
        │
        ▼
ProfileService.searchProfiles()
        │
        ├── applyProfileSearchFilters()
        ├── applyProfileSort()
        └── mapPublicProfileRow()
        │
        ▼
ResultsGrid → SearchResultCard
```

## Filtering

| Parameter | URL key | Behavior |
|-----------|---------|----------|
| Text query | `q` | `ilike` on `display_name` and `username` |
| Profession | `profession` | UUID match on `profession_id` |
| City | `city` | Partial `ilike` match |
| State | `state` | Partial `ilike` match |

By default, only **onboarding-complete** profiles appear (`profession_id`, `city`, `state`, and `display_name` all set). Incomplete profiles are excluded from discovery.

## Sorting

| Value | Label | Order |
|-------|-------|-------|
| `newest` | Newest | `created_at DESC` (default) |
| `rating` | Highest rated | `average_rating DESC` |
| `reviews` | Most reviews | `total_reviews DESC` |
| `name` | Name (A–Z) | `display_name ASC` |

## Pagination

- Default: **12 results per page**
- URL param: `page` (1-based)
- `SearchPagination` shows prev/next and total count
- Changing filters or sort resets to page 1

## Components

| Component | Type | Role |
|-----------|------|------|
| `SearchForm` | Client | Submit search query via URL |
| `SearchBar` | Server-friendly | Accessible search input |
| `FilterPanel` | Client | Profession, city, state filters |
| `SortDropdown` | Client | Sort order selector |
| `ResultsGrid` | Server | Responsive card grid |
| `SearchResultCard` | Server | Profile card with rating + location |
| `EmptyResults` | Server | Zero-state messaging |
| `LoadingResults` | Server | Skeleton grid (`loading.tsx`) |
| `SearchPagination` | Client | Page navigation |

## Future full-text search improvements

Current search uses PostgreSQL `ilike` — sufficient for launch-scale directories. Future enhancements:

1. **`tsvector` + GIN index** on `display_name`, `bio` for ranked full-text search
2. **Trigram index** (`pg_trgm`) for fuzzy name matching and typo tolerance
3. **Dedicated search service** (e.g. Typesense, Meilisearch) at scale
4. **Geo search** with PostGIS for radius-based discovery
5. **Search analytics** to surface popular queries (separate analytics phase)

Migration `014_search_indexes.sql` adds btree indexes for common filter and sort columns.

## Key files

| Area | Path |
|------|------|
| Page | `src/app/search/page.tsx` |
| Service | `src/services/profiles/profile.service.ts` |
| Query helpers | `src/services/profiles/profile-search.query.ts` |
| Validators | `src/lib/validators/profile-search.ts` |
| URL helpers | `src/lib/search/params.ts` |
| Types | `src/types/search.ts` |
| Components | `src/components/search/*` |
| Indexes | `supabase/migrations/014_search_indexes.sql` |

## Public access

`/search` is a **public route** — no login required. This matches the goal of helping anyone discover professionals.
