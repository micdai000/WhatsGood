# TrustLoop — Database Architecture

> Last updated: June 2025
> Stack: PostgreSQL (via Supabase), Next.js 15, TypeScript

---

## Overview

TrustLoop is a review platform where service professionals collect verified reviews from their clients. The database is designed around four tables that cover the MVP use case: professionals create profiles, request reviews from clients, and display those reviews publicly.

---

## Entity Relationship Diagram

```
┌─────────────────┐
│   professions   │
│─────────────────│
│ id (PK)         │
│ name            │
│ slug (UNIQUE)   │
│ icon            │
│ created_at      │
└────────┬────────┘
         │
         │  1 : many
         │
┌────────▼────────┐       ┌──────────────────────┐
│    profiles     │       │       reviews         │
│─────────────────│       │──────────────────────│
│ id (PK/FK)      │──────▶│ id (PK)              │
│ slug (UNIQUE)   │ 1:many│ profile_id (FK)      │
│ full_name       │       │ reviewer_name        │
│ profession_id   │       │ reviewer_email       │
│ bio             │       │ rating (1-5)         │
│ city            │       │ review_text          │
│ state           │       │ service_description  │
│ profile_photo   │       │ verified             │
│ average_rating  │       │ created_at           │
│ total_reviews   │       └──────────────────────┘
│ created_at      │
│ updated_at      │       ┌──────────────────────┐
│                 │       │   review_requests    │
│                 │──────▶│──────────────────────│
│                 │ 1:many│ id (PK)              │
└─────────────────┘       │ profile_id (FK)      │
         ▲                │ email                │
         │                │ token (UNIQUE)       │
    1 : 1                 │ status (ENUM)        │
         │                │ created_at           │
┌────────┴────────┐       └──────────────────────┘
│  auth.users     │
│  (Supabase)     │
└─────────────────┘
```

---

## Tables

### `professions`

**Purpose:** Lookup table for professional categories. Normalized so we can add new professions, attach icons, and build SEO-friendly category pages without modifying the profiles table.

| Column       | Type        | Constraints       | Description                            |
|-------------|-------------|-------------------|----------------------------------------|
| `id`        | UUID        | PK, auto-gen      | Unique identifier                       |
| `name`      | TEXT        | NOT NULL, UNIQUE   | Human-readable name ("Electrician")     |
| `slug`      | TEXT        | NOT NULL, UNIQUE   | URL-safe identifier ("electrician")     |
| `icon`      | TEXT        | nullable           | Lucide icon name for UI rendering       |
| `created_at`| TIMESTAMPTZ | NOT NULL, default  | Row creation timestamp                  |

**RLS:** Publicly readable. No client-side writes (managed by admins or seed data).

---

### `profiles`

**Purpose:** Extends `auth.users` with business-specific fields. The `id` column directly references `auth.users.id`, creating a 1:1 relationship. Supabase's `auth` schema is internal and cannot be queried from the client — this table is the public-facing representation of a user.

| Column           | Type          | Constraints                 | Description                                      |
|-----------------|---------------|----------------------------|--------------------------------------------------|
| `id`            | UUID          | PK, FK → auth.users(id)    | Same UUID as the auth user                        |
| `slug`          | TEXT          | NOT NULL, UNIQUE            | Vanity URL (/p/john-doe)                          |
| `full_name`     | TEXT          | NOT NULL                    | Display name                                      |
| `profession_id` | UUID          | FK → professions(id)        | What type of professional they are                |
| `bio`           | TEXT          | nullable                    | Free-text bio                                     |
| `city`          | TEXT          | nullable                    | City for location-based search                    |
| `state`         | TEXT          | nullable                    | State for location-based search                   |
| `profile_photo` | TEXT          | nullable                    | URL to image in Supabase Storage                  |
| `average_rating`| NUMERIC(3,2)  | NOT NULL, default 0.00      | Denormalized average — updated by trigger          |
| `total_reviews` | INTEGER       | NOT NULL, default 0         | Denormalized count — updated by trigger            |
| `created_at`    | TIMESTAMPTZ   | NOT NULL, default now()     | Row creation timestamp                            |
| `updated_at`    | TIMESTAMPTZ   | NOT NULL, default now()     | Auto-updated by trigger on every UPDATE            |

**Why denormalize `average_rating` / `total_reviews`?**
Computing `AVG()` across all reviews on every profile page load is expensive. By storing the computed values directly on the profile, reads are a single row fetch. The trigger on the `reviews` table keeps them in sync automatically.

**RLS:**
- SELECT: Public (anyone can view profiles)
- INSERT: Only the authenticated user can insert their own row (`auth.uid() = id`)
- UPDATE: Only the profile owner (`auth.uid() = id`)

**Triggers:**
- `on_profile_updated`: Sets `updated_at = now()` before every UPDATE.

---

### `reviews`

**Purpose:** The core data — reviews left by clients. Reviewers do **not** need a TrustLoop account. Their name and email are stored directly on the review row. The `verified` flag distinguishes reviews that came through an authenticated review request link.

| Column               | Type        | Constraints                  | Description                                  |
|----------------------|-------------|------------------------------|----------------------------------------------|
| `id`                 | UUID        | PK, auto-gen                 | Unique identifier                            |
| `profile_id`         | UUID        | NOT NULL, FK → profiles(id)  | The professional being reviewed              |
| `reviewer_name`      | TEXT        | NOT NULL                     | Name of the person leaving the review        |
| `reviewer_email`     | TEXT        | NOT NULL                     | Email of the reviewer (for verification)     |
| `rating`             | INTEGER     | NOT NULL, CHECK 1-5          | Star rating                                  |
| `review_text`        | TEXT        | nullable                     | Written review content                       |
| `service_description`| TEXT        | nullable                     | What service was performed                   |
| `verified`           | BOOLEAN     | NOT NULL, default false      | True if submitted via a review_request token |
| `created_at`         | TIMESTAMPTZ | NOT NULL, default now()      | When the review was submitted                |

**RLS:**
- SELECT: Public (reviews are displayed on profile pages)
- INSERT: **No client-side policy.** Reviews are inserted through a server-side API route using the `service_role` key. This prevents spam and ensures reviews can only be submitted through validated flows.

**Triggers:**
- `on_review_inserted`: After each INSERT, recalculates `average_rating` and `total_reviews` on the parent `profiles` row.

---

### `review_requests`

**Purpose:** Professionals send review request emails to their clients. Each request generates a unique `token` (UUID) that is embedded in the review link (e.g., `/review?token=abc-123`). When a client clicks the link and submits a review, the API validates the token, marks the request as `completed`, and sets `verified = true` on the review.

| Column       | Type                        | Constraints                  | Description                          |
|-------------|----------------------------|------------------------------|--------------------------------------|
| `id`        | UUID                        | PK, auto-gen                 | Unique identifier                    |
| `profile_id`| UUID                        | NOT NULL, FK → profiles(id)  | The professional who sent it         |
| `email`     | TEXT                        | NOT NULL                     | Client's email address               |
| `token`     | UUID                        | NOT NULL, UNIQUE, auto-gen   | Unique link token                    |
| `status`    | review_request_status ENUM  | NOT NULL, default 'pending'  | pending → completed \| expired       |
| `created_at`| TIMESTAMPTZ                 | NOT NULL, default now()      | When the request was created         |

**RLS:**
- SELECT: Only the profile owner (`auth.uid() = profile_id`)
- INSERT: Only the profile owner (`auth.uid() = profile_id`)

---

## Indexes

| Index                         | Table            | Column(s)         | Why                                                        |
|------------------------------|------------------|-------------------|------------------------------------------------------------|
| `idx_profiles_slug`          | profiles         | slug              | Profile pages load by slug — avoids full table scan         |
| `idx_profiles_profession`    | profiles         | profession_id     | Filtering by profession category                            |
| `idx_profiles_location`      | profiles         | (state, city)     | Location-based search ("plumbers in Denver, CO")            |
| `idx_reviews_profile`        | reviews          | profile_id        | Loading all reviews for a profile — most frequent join       |
| `idx_reviews_created`        | reviews          | created_at DESC   | Sorting reviews newest-first without expensive sort          |
| `idx_review_requests_profile`| review_requests  | profile_id        | Dashboard view listing all sent requests                     |
| `idx_review_requests_token`  | review_requests  | token             | Review submission page validates by token — must be fast     |
| `idx_professions_slug`       | professions      | slug              | Profession category pages loaded by slug                     |

Note: `UNIQUE` constraints on `profiles.slug`, `professions.slug`, `professions.name`, and `review_requests.token` automatically create B-tree indexes. The explicit indexes above cover non-unique columns.

---

## Storage Buckets

| Bucket           | Public | Max Size | Allowed Types                          | Purpose                 |
|-----------------|--------|----------|----------------------------------------|-------------------------|
| `profile-images`| Yes    | 5 MB     | image/jpeg, image/png, image/webp, image/gif | Profile photos / avatars |

**Folder convention:** `profile-images/{user_id}/filename.ext`

RLS ensures users can only upload/update/delete files in their own folder. Reading is public.

**Future buckets** (not created yet — add when needed):
- `review-attachments` — photos attached to reviews
- `documents` — business licenses, certifications

---

## Design Decisions

### Why `profiles` mirrors `auth.users` instead of adding columns
Supabase's `auth.users` lives in the `auth` schema which is not directly queryable from the client SDK with RLS. A separate `profiles` table in the `public` schema gives us full control over columns, policies, and triggers.

### Why reviewers don't need accounts
The core value proposition is frictionless review collection. Requiring clients to create an account would kill conversion rates. The `review_requests.token` system provides verification without authentication.

### Why ratings are denormalized on profiles
A professional with 500 reviews would require `SELECT AVG(rating) FROM reviews WHERE profile_id = ?` on every profile view. By maintaining `average_rating` and `total_reviews` directly on the profile — updated by a database trigger — profile page loads are a single-row fetch.

### Why reviews have no client-side INSERT policy
This is intentional security. If we allowed `INSERT` via RLS, anyone could submit reviews directly through the Supabase client. Instead, reviews flow through a server-side API route that validates the review request token, checks for duplicates, and uses the `service_role` key to bypass RLS.

### Why we use an ENUM for review_request status
The status values are a finite, well-defined set (`pending`, `completed`, `expired`). An ENUM enforces this at the database level and is more storage-efficient than TEXT.

---

## Future Scalability

| Feature                    | What changes                                                           |
|---------------------------|------------------------------------------------------------------------|
| Search                    | Add `tsvector` column to profiles for full-text search                 |
| Review replies            | Add `replies` table with FK to reviews                                 |
| Multiple locations        | Add `locations` table, change profiles → locations to many-to-many     |
| Review photos             | Add `review-attachments` storage bucket + `review_images` table        |
| Analytics dashboard       | Add `profile_analytics` table with daily aggregated views/clicks       |
| Subscription tiers        | Add `subscriptions` table linked to profiles                           |
| Badges / certifications   | Add `badges` table + `profile_badges` join table                       |

The current schema is designed so none of these additions require breaking changes to existing tables.
