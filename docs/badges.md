# Trust badges

TrustLoop profiles show a **monthly earned trust badge** (Building trust / Bronze / Silver / Gold / Elite) instead of a raw 1–5 star average. Badges are computed from recent reviews, weighted by recency and verification, then ranked within the member's profession.

## Architecture overview

```
npm run badges:compute  (1st of each month, or manual)
        │
        ▼
BadgeService.computeBadgesForPeriod(YYYY-MM)
        │
        ▼
badge-scoring.ts (pure functions)
        │
        ▼
badge_snapshots upsert + profiles.current_badge_*
```

Public UI reads denormalized `profiles.current_badge_tier` and `profiles.current_badge_period` for fast display. History and breakdown details come from `badge_snapshots`.

## Why badges are batch-computed

Percentile ranking requires the **entire profession cohort** at once. Unlike `average_rating` (updated per review via `handle_review_change()`), badges are intentionally **not** recomputed on every insert. A scheduled job runs monthly.

## Data model

### `badge_snapshots` (migration `017`)

| Column | Type | Description |
|--------|------|-------------|
| `profile_id` | UUID FK | Professional |
| `period` | TEXT | `YYYY-MM` earning period |
| `trust_score` | NUMERIC | 0–100 internal score |
| `percentile` | NUMERIC, nullable | Rank within profession; `NULL` when fixed-threshold fallback used |
| `badge_tier` | TEXT | `none` \| `bronze` \| `silver` \| `gold` \| `elite` |
| `review_count_window` | INTEGER | Reviews in trailing 90-day window |
| `eligible` | BOOLEAN | `false` if fewer than 3 reviews in window |
| `component_breakdown` | JSONB | Internal scoring components (not shown verbatim in UI) |
| `computed_at` | TIMESTAMPTZ | When the snapshot was written |

Unique on `(profile_id, period)`.

### Denormalized profile columns

| Column | Description |
|--------|-------------|
| `current_badge_tier` | Latest earned tier (default `none`) |
| `current_badge_period` | `YYYY-MM` for the current badge |

## Trust score algorithm

Computed over reviews in a **trailing 90-day window** from the 1st of the period month.

1. **Recency weight** — `exp(-days_old / 45)` per review (half-life ~31 days)
2. **Verified multiplier** — 1.5× when `review_request_id` is set (verified review)
3. **Bayesian-adjusted star average** — shrinks toward profession mean with confidence `C = 10`
4. **Wilson lower bound** — on weighted `would_recommend` proportion (95% confidence)
5. **Trust score** — `100 × (0.6 × bayesian/5 + 0.4 × wilson_recommend)`

Constants live in `src/lib/constants/badges.ts`. Pure math is in `src/services/badges/badge-scoring.ts` with unit tests.

## Tier assignment

Within each `profession_id` cohort:

| Percentile (best first) | Tier |
|-------------------------|------|
| ≤ 5% | Elite |
| ≤ 20% | Gold |
| ≤ 50% | Silver |
| else (eligible) | Bronze |
| not eligible | none |

**Small cohort guard:** if fewer than 10 eligible profiles in a profession, fixed trust-score thresholds are used instead and `percentile` is stored as `NULL`:

| Trust score | Tier |
|-------------|------|
| ≥ 90 | Elite |
| ≥ 75 | Gold |
| ≥ 55 | Silver |
| ≥ 35 | Bronze |
| else | none |

## Running the compute job

```bash
# Current month
npm run badges:compute

# Specific period (backfill / replay)
npm run badges:compute -- 2026-07
```

Requires in `.env.local`:

- `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Apply migration first: `npm run db:migrate`

### Scheduling

Run on the **1st of each month**. Options:

- **GitHub Actions** scheduled workflow calling `npm run badges:compute`
- **Supabase pg_cron** invoking the same script via an edge function or external runner

The repo ships the CLI entry point (`scripts/compute-badges.mjs`); wire scheduling to your deployment host.

## UI behavior

- **Search / profile cards** — `TrustBadge` pill instead of star average
- **Public profile stats** — trust badge + review count
- **Reviews section** — `TrustBadgeSummary` with plain-language “How this badge works” (no exposed weights)
- **Badge history strip** — last 12 months of tier pills
- **Leave review form** — still collects 1–5 stars; stars feed the algorithm, not the public headline

`badge_tier = none` shows **Building trust**, not empty stars.

## RLS

- `badge_snapshots`: public `SELECT`; writes via service role only (same pattern as `activity`)
- Clients never insert or update badge rows directly

## Backfill / idempotency

Re-running `computeBadgesForPeriod` for a past month upserts snapshots cleanly. `profiles.current_badge_*` is only updated when the recomputed period is **≥** the profile's existing `current_badge_period`.

## Related docs

- [Reviews & ratings](./reviews.md) — review collection and `handle_review_change`
- [Review requests](./review-requests.md) — verified reviews via `review_request_id`
