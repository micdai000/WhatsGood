# Professional Dashboard & Analytics

The professional dashboard is TrustLoop's **action hub** — it helps professionals understand performance at a glance and decide what to do next (share a profile link, send a review request, follow up on pending invitations).

> Notifications, messaging, booking, admin tools, AI features, and profile view tracking are **not** part of this phase.

## Why dashboards should drive action

A dashboard is not a static report. Professionals visit it to answer:

- How am I doing? (ratings, review volume, growth)
- What needs attention? (pending review requests)
- What should I do next? (copy profile link, request a review)

Metrics without clear next steps create anxiety, not improvement. TrustLoop surfaces **quick actions** alongside analytics so every visit can end with a concrete step.

## Why aggregation belongs in DashboardService

`ProfileService`, `ReviewService`, and `ReviewRequestService` each own a single domain. The dashboard needs **cross-cutting aggregates**:

| Metric | Sources |
|--------|---------|
| Average rating / total reviews | `profiles` (denormalized) |
| Request counts & success rate | `review_requests` |
| Review trend & distribution | `reviews` |
| Activity feed | `reviews` + `review_requests` |

Putting this in `ProfileService` would couple profile CRUD to analytics queries and encourage duplicate fetches from the page. `DashboardService` is the single entry point for dashboard data — one fetch, in-memory aggregation, typed `DashboardData` response.

## Server-side aggregation & performance

The dashboard page is a **Server Component**. `DashboardService.getDashboard()` runs three parallel Supabase queries (profile, reviews, review_requests), then computes all statistics in memory. Benefits:

- **One round trip** from the page — no waterfall of service calls from the client
- **No duplicate queries** — individual methods (`getStatistics`, `getReviewTrend`, etc.) exist for reuse/testing but the page only calls `getDashboard()`
- **Smaller client bundle** — charts and stats render as HTML/CSS without client-side data fetching

## Architecture

```
/dashboard (Server Component)
        │
        ▼
authService.getSession()
        │
        ▼
dashboardService.getDashboard(profileId)
        │
        ├── fetchSourceData()  ── parallel ──┬── profiles
        │                                    ├── reviews
        │                                    └── review_requests
        │
        └── dashboard.analytics.ts
              ├── computeStatistics()
              ├── computeReviewTrend()
              ├── computeRatingDistribution()
              └── computeRecentActivity()
        │
        ▼
DashboardData → reusable UI components
```

### File layout

| Path | Role |
|------|------|
| `src/services/dashboard/dashboard.service.ts` | Auth, DB access, orchestration |
| `src/services/dashboard/dashboard.analytics.ts` | Pure aggregation helpers |
| `src/types/dashboard.ts` | `DashboardData`, statistics, trend, activity types |
| `src/lib/validators/dashboard.ts` | `dashboardProfileIdSchema`, `dashboardTrendWeeksSchema` |
| `src/components/dashboard/*` | Presentational components |

## DashboardService API

### `getDashboard(profileId)`

Primary method. Returns `DashboardData`:

- `profile` — display name, username, public profile URL
- `statistics` — headline metrics
- `recentReviews` — latest 5 reviews
- `recentReviewRequests` — latest 5 requests
- `recentActivity` — merged timeline (top 10)
- `reviewTrend` — weekly buckets (default 8 weeks)
- `ratingDistribution` — 1–5 star counts

### Granular methods

These call `fetchSourceData()` independently — use only when you need a subset outside the main dashboard page:

- `getStatistics(profileId)`
- `getRecentActivity(profileId, limit?)`
- `getReviewTrend(profileId, weeks?)`
- `getRatingDistribution(profileId)`

## Analytics calculations

### Average rating & total reviews

Read from denormalized `profiles.average_rating` and `profiles.total_reviews` (maintained by review triggers). Avoids recalculating from all review rows on every dashboard load.

### Review request counts

Counted from in-memory `review_requests` rows:

- **Pending** — `status = 'pending'`
- **Completed** — `status = 'completed'`
- **Expired** — `status = 'expired'`

### Review request success rate

```
successRate = completed / (completed + expired) × 100
```

Returns `null` when no requests have resolved (no completed or expired yet). Rounded to nearest integer.

### Review growth (last 30 days)

Compares reviews created in the last 30 days vs the prior 30 days:

```
changePercent = ((last30 - previous30) / previous30) × 100
```

- `null` when both periods are zero
- `100` when previous period is zero but current period has reviews

### Review trend

Reviews grouped into **weekly buckets** (default 8 weeks, configurable 4–12 via `dashboardTrendWeeksSchema`). Each point includes a short date label and count.

### Rating distribution

Counts reviews per star level (1–5). Reuses the shared `RatingBreakdown` type and `RatingBreakdown` component.

### Recent activity

Merges events from reviews and review requests:

| Event | Trigger |
|-------|---------|
| `review_received` | New review |
| `review_request_created` | Request created |
| `review_request_completed` | Request completed |
| `review_request_expired` | Request expired |

Sorted by timestamp descending, limited to 10 items.

## Placeholder metrics

Metrics not yet tracked render with a **dashed border** and explicit copy — never fake numbers.

| Metric | Status |
|--------|--------|
| Profile views | Placeholder — "Not yet tracked — coming in a future update" |

## UI components

Reusable dashboard components in `src/components/dashboard/`:

| Component | Purpose |
|-----------|---------|
| `DashboardHeader` | Welcome message |
| `AnalyticsCard` | Single metric tile |
| `StatisticsGrid` | Key stats grid |
| `QuickActions` | Profile URL + action links |
| `TrendChart` | Reviews-over-time bar chart (CSS) |
| `RatingDistribution` | Star breakdown |
| `ActivityFeed` | Recent activity timeline |
| `EmptyAnalytics` | Empty state for charts |
| `DashboardLoading` | Skeleton loading state |

## Accessibility & UX

- Semantic headings and `aria-label` on chart regions
- Keyboard-focusable links and buttons in quick actions
- `loading.tsx` skeleton for route transitions
- `EmptyDashboard` / `EmptyAnalytics` for zero-data states
- Mobile-first responsive grids (`sm:`, `lg:`, `xl:` breakpoints)

## Future metrics

Planned for later phases (not implemented):

- **Profile views** — page impression tracking on `/p/[username]`
- **Conversion rate** — views → review requests → completed reviews
- **Response time** — average days from request to completed review
- **Search impressions** — how often the profile appears in `/search`

Extend by:

1. Adding columns or analytics tables in a migration
2. Extending `DashboardSourceData` and `computeStatistics()`
3. Replacing placeholder `PlaceholderMetric` entries with real values
4. Adding new presentational components — no changes to page data-fetching pattern

## Usage

```ts
import { dashboardService } from "@/services/dashboard";

const result = await dashboardService.getDashboard(userId);

if (isSuccess(result)) {
  const { statistics, reviewTrend } = result.data;
}
```

**Do not** query Supabase directly from React components for dashboard data. All access goes through `DashboardService`.
