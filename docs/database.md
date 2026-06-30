# WhatsGood — Database Architecture

> Last updated: June 2025  
> Stack: PostgreSQL (via Supabase), Next.js 15, TypeScript

---

## Overview

WhatsGood (package name: `meritt`) is a reputation voting platform. Users vote to **promote**, **maintain**, or **demote** entities — food, places, entertainment, and movies/shows. They follow entities, curate **libraries**, and see an **activity feed** of community actions.

This schema mirrors the types in `src/data/mock.ts`.

---

## Entity Relationship Diagram

```
auth.users
    │
    │ 1:1
    ▼
profiles ─────────────────────────────────────────────┐
    │                                                  │
    ├── 1:many ──► entities ◄── created_by            │
    │                  │                               │
    │                  ├── 1:many ──► food_locations    │
    │                  │                               │
    │                  ├── 1:many ──► votes ◄── user_id
    │                  │                               │
    │                  └── 1:many ──► entity_follows    │
    │                                                  │
    ├── 1:many ──► libraries ◄── creator_id           │
    │                  │                               │
    │                  ├── 1:many ──► library_items    │
    │                  └── 1:many ──► library_follows  │
    │                                                  │
    ├── 1:many ──► user_follows (follower/following)  │
    │                                                  │
    └── 1:many ──► activity (feed events)              │
```

---

## Tables

### `profiles`

Extends `auth.users` with app-specific fields. Same pattern as before — `auth.users` is internal; this is the public user record.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK, FK → auth.users | Same UUID as auth user |
| `username` | TEXT UNIQUE | Handle (@michaeld) |
| `display_name` | TEXT | Display name |
| `avatar` | TEXT | URL in `avatars` storage bucket |
| `bio` | TEXT | User bio |
| `followers_count` | INTEGER | Denormalized — updated by triggers |
| `following_count` | INTEGER | Denormalized |
| `total_votes_cast` | INTEGER | Denormalized |
| `entities_followed_count` | INTEGER | Denormalized |
| `libraries_created_count` | INTEGER | Denormalized |
| `created_at` / `updated_at` | TIMESTAMPTZ | Timestamps |

**RLS:** Public read. Owner can insert/update.

---

### `entities`

Things users vote on. Maps to the `Entity` type in mock data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | |
| `slug` | TEXT UNIQUE | URL path: `/food/costco-pizza` |
| `name` | TEXT | Display name |
| `category` | ENUM | `food`, `places`, `entertainment`, `movies_shows` |
| `image` | TEXT | Cover image URL |
| `score` | INTEGER | Reputation score (promote +1, demote -1) |
| `total_votes` | INTEGER | Vote count |
| `followers_count` | INTEGER | Denormalized |
| `location` | TEXT | Country/region for search |
| `created_by` | UUID FK → profiles | Who added it (nullable) |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

**Tier is NOT stored.** The app computes it from `score` via `getTier()` in `src/data/mock.ts`.

**RLS:** Public read. Authenticated users can create. Creators can update their own.

---

### `food_locations`

Physical locations for food entities. Maps to `FoodLocation` in mock data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | |
| `entity_id` | UUID FK → entities | Parent food entity |
| `restaurant` | TEXT | Restaurant name |
| `address` | TEXT | Street address |
| `city` | TEXT | City, state |
| `location` | TEXT | Country/region |
| `score` | INTEGER | Location-specific score |
| `total_votes` | INTEGER | Location-specific vote count |

Users can vote on the entity overall OR on a specific location.

---

### `votes`

Maps to the `Vote` type. One vote per user per entity (or per food location).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | |
| `user_id` | UUID FK → profiles | Voter |
| `entity_id` | UUID FK → entities | What they voted on |
| `food_location_id` | UUID FK → food_locations | Optional — set for location votes |
| `vote_type` | ENUM | `promote`, `maintain`, `demote` |

**Triggers:** `handle_vote_change()` updates scores on entities/food_locations and `total_votes_cast` on profiles.

---

### `libraries`

Curated collections. Maps to the `Library` type.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | |
| `name` | TEXT | Library title |
| `description` | TEXT | |
| `cover_image` | TEXT | |
| `creator_id` | UUID FK → profiles | Owner |
| `is_public` | BOOLEAN | Public vs private |
| `follower_count` | INTEGER | Denormalized |

---

### `library_items`

Join table: which entities are in which library.

| Column | Type | Description |
|--------|------|-------------|
| `library_id` | UUID FK | |
| `entity_id` | UUID FK | |
| `position` | INTEGER | Display order |
| `added_at` | TIMESTAMPTZ | |

Primary key: `(library_id, entity_id)`.

---

### Follow tables

| Table | Purpose |
|-------|---------|
| `user_follows` | User follows another user |
| `entity_follows` | User follows an entity |
| `library_follows` | User follows a library |

All have triggers that keep denormalized counts in sync.

---

### `activity`

Feed events. Maps to `ActivityItem` in mock data.

| Column | Type | Description |
|--------|------|-------------|
| `type` | ENUM | promote, demote, maintain, create_library, tier_up, tier_down, follow |
| `user_id` | UUID | Who did it (nullable) |
| `entity_id` | UUID | Related entity (nullable) |
| `library_id` | UUID | Related library (nullable) |
| `tier` / `previous_tier` | TEXT | For tier change events |

Inserted by server-side API routes, not directly by clients.

---

## Storage Buckets

| Bucket | Purpose | Folder convention |
|--------|---------|---------------------|
| `avatars` | Profile photos | `avatars/{user_id}/` |
| `entity-images` | Entity cover images | `entity-images/{entity_id}/` |
| `library-covers` | Library cover images | `library-covers/{library_id}/` |

---

## Applying to Supabase

Because you previously uploaded the old TrustLoop schema, run migrations **in order**:

1. `000_reset_legacy_schema.sql` — drops old tables
2. `001` through `010` — creates the new schema
3. `seed.sql` — optional sample data

In the Supabase SQL Editor, run each file in order. Or use the Supabase CLI:

```bash
supabase db push
```

---

## Design Decisions

### Why no `tier` column on entities
Tier is derived from score thresholds in the frontend. Storing it would require triggers on every score change and duplicate logic already in `getTier()`.

### Why denormalized counts
Profile pages, entity cards, and leaderboards need follower/vote counts on every render. Triggers keep counts accurate without expensive `COUNT(*)` on hot paths.

### Why `movies_shows` not `movies-shows` in the DB
PostgreSQL enum values can't contain hyphens. The app maps `movies_shows` ↔ `movies-shows` at the API layer.

### Why activity has no client INSERT policy
Feed events should only be created by trusted server logic to prevent spam.

---

## Future Scalability

| Feature | Change |
|---------|--------|
| Full-text search | Add `tsvector` columns on entities and food_locations |
| Comments | New `comments` table on entities |
| Notifications | New `notifications` table |
| Moderation | Add `status` enum on entities (active, flagged, removed) |
| Vote history | Append-only `vote_events` table for analytics |

The current schema supports all of these without breaking changes.
