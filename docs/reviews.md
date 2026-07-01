# Reviews & Ratings

TrustLoop's core value proposition is **verified social proof** — helping independent professionals build trust through authentic client reviews. This document describes the review architecture, data flow, validation, rating calculations, and how profile statistics stay in sync.

## Why reviews are the core feature

TrustLoop is not a directory or a portfolio site. Professionals join to **demonstrate credibility** through what others say about their work. Reviews:

- Give prospects confidence before hiring
- Differentiate professionals with similar credentials
- Create a durable reputation asset tied to a public profile

Everything else in TrustLoop (onboarding, public profiles, future requests) exists to support collecting and displaying reviews.

## Architecture overview

```
Leave Review Page (/review/[slug])
        │
        ▼
createReviewAction (Server Action)
        │
        ▼
ReviewService.createReview()
        │
        ▼
Supabase `reviews` table
        │
        ▼
handle_review_change() trigger
        │
        ▼
profiles.average_rating + profiles.total_reviews
```

Public profiles read denormalized stats from `profiles` and fetch recent reviews via `ReviewService.getReviews()`.

## Why all review operations go through ReviewService

React components and Server Actions must **never** call Supabase directly. `ReviewService` is the single gateway because it:

1. **Validates input** with Zod schemas before any database write
2. **Maps errors** to typed `ServiceResult` responses (`ConflictError` for duplicates, `NotFoundError` for missing profiles)
3. **Centralizes logging** for debugging and future moderation
4. **Enforces authorization** on destructive operations (`deleteReview` — profile owner only today, admin-ready)
5. **Keeps components thin** — UI only handles presentation and form state

## Data model

### `reviews` table (migration `012`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | |
| `profile_id` | UUID FK → profiles | Professional being reviewed |
| `reviewer_name` | TEXT | Public display name |
| `reviewer_email` | TEXT | Private — duplicate prevention only |
| `rating` | INTEGER 1–5 | Overall star rating |
| `title` | TEXT | Short review headline |
| `body` | TEXT | Full review text |
| `would_recommend` | BOOLEAN | Yes/No recommendation |
| `relationship` | TEXT nullable | Optional (Client, Student, etc.) |
| `verified` | BOOLEAN | Reserved for future verified flows |
| `created_at` | TIMESTAMPTZ | |

**Unique constraint:** `(profile_id, reviewer_email)` — one review per email per professional.

### Denormalized profile stats

| Column | Type | Description |
|--------|------|-------------|
| `average_rating` | NUMERIC(3,2) | Mean of all review ratings |
| `total_reviews` | INTEGER | Count of reviews |

These are updated automatically by the database trigger — services read them; they never write them directly.

## Rating calculations

### Trigger: `handle_review_change()`

Fires `AFTER INSERT OR DELETE` on `reviews`. For the affected profile it runs:

```sql
SELECT COUNT(*), ROUND(AVG(rating), 2)
FROM reviews WHERE profile_id = target_profile_id;
```

Then updates `profiles.total_reviews` and `profiles.average_rating`.

**Why triggers?** Any code path that inserts or deletes a review (today: `ReviewService`, tomorrow: moderation tools, admin panel) keeps stats correct without duplicating aggregation logic in application code.

### Service methods

| Method | Purpose |
|--------|---------|
| `getAverageRating(profileId)` | Reads denormalized stats from `profiles` |
| `getRatingBreakdown(profileId)` | Computes per-star counts for the breakdown chart |
| `getReviews(profileId, pagination)` | Paginated review list, newest first |

## Validation

Schemas in `src/lib/validators/review.ts`:

| Schema | Used by |
|--------|---------|
| `leaveReviewSchema` | `createReviewAction` — slug + all form fields |
| `createReviewSchema` | `ReviewService.createReview` — profileId + fields |
| `reviewIdSchema` | `getReview`, `deleteReview` |
| `reviewsByProfileSchema` | `getReviews`, `getAverageRating` |

Limits (from `src/lib/constants`):

- Rating: 1–5 (required)
- Title: max 120 characters
- Body: 10–2000 characters
- Relationship: max 100 characters (optional)

## Data flow: leaving a review

1. User visits `/review/[slug]`
2. Server Component loads public profile via `ProfileService.getPublicProfile`
3. Client `ReviewForm` collects fields and calls `createReviewAction`
4. Action validates with `leaveReviewSchema`, resolves `profileId` from slug server-side (never trusts client-supplied IDs)
5. `ReviewService.createReview` inserts the row
6. Trigger updates profile stats
7. Action revalidates profile and review paths
8. User is redirected to the public profile with a success toast

## Public profile display

`ProfileReviewsSection` (Server Component) fetches:

- Recent reviews (5 per page by default)
- Rating breakdown for the distribution chart
- Summary card with average + count from `PublicProfile`

If `totalReviews === 0`, shows `EmptyReviews` with a CTA to leave the first review.

## Edge cases

| Case | Handling |
|------|----------|
| Profile not found | `notFound()` on `/review/[slug]` and `/u/[slug]` |
| Duplicate review | Unique constraint → `ConflictError` → friendly message |
| Validation errors | Zod → `ValidationError` with per-field messages |
| Database failure | `DatabaseError` → generic user message + server log |
| Incomplete profile | Warning banner on leave-review page; submission still allowed |

## RLS policies

| Operation | Policy |
|-----------|--------|
| SELECT | Public read |
| INSERT | Anyone (guest or authenticated) |
| DELETE | Profile owner (`auth.uid() = profile_id`) |

## Future moderation support

The schema includes `verified` (default `false`) for future verified-review flows. `deleteReview` is owner-scoped today but structured so an admin role check can be added in `ReviewService` without changing components.

Planned extensions (not in this phase):

- Review requests and email sharing
- Admin moderation queue
- Flagging / hiding reviews
- Verified badge when linked to a completed request

## Key files

| Area | Path |
|------|------|
| Migration | `supabase/migrations/012_create_reviews.sql` |
| Service | `src/services/reviews/review.service.ts` |
| Mapper | `src/services/reviews/review.mapper.ts` |
| Validators | `src/lib/validators/review.ts` |
| Types | `src/types/review.ts` |
| Server Action | `src/app/actions/review.actions.ts` |
| Leave review page | `src/app/review/[slug]/page.tsx` |
| Components | `src/components/reviews/*` |
| Profile section | `src/components/profile/profile-reviews-section.tsx` |

## Applying the migration

```bash
npm run db:migrate
npm run db:verify
```

See [database-migrations.md](./database-migrations.md) for connection string setup.
