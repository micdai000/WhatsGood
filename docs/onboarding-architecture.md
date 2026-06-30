# Onboarding Architecture

This document describes how TrustLoop routes authenticated users based on profile existence, and how onboarding stays separate from authentication.

## Why authentication and profiles are separate

Authentication answers **who** the user is: identity, credentials, sessions, and email verification. A profile answers **how** they present themselves professionally: display name, slug, profession, reviews, and public presence.

Keeping these concerns separate provides:

| Concern | Auth layer | Profile layer |
|--------|------------|---------------|
| Data store | `auth.users` (Supabase Auth) | `profiles` table |
| Lifecycle | Created at sign-up | Created during onboarding |
| Failure modes | Invalid credentials, unverified email | Missing or incomplete profile |
| Public access | Never exposed | Public profile pages |

Sign-up does **not** create a profile row. A user can be fully authenticated but have no professional profile yet. Routing logic bridges the two layers without coupling them in code.

## Why onboarding happens only once

Onboarding is the **one-time path** from “authenticated account” to “professional profile exists.” After a profile row is created for the user’s auth ID, onboarding status becomes `has_profile` permanently (until profile deletion, which is out of scope for this phase).

Guards enforce this:

- `/welcome` — only for users **without** a profile
- `/dashboard` — only for users **with** a profile

Users who already completed setup are redirected away from `/welcome` to `/dashboard`. Users who have not created a profile cannot access `/dashboard` and are sent to `/welcome`.

This prevents repeat onboarding, duplicate profile creation attempts, and confusing navigation loops.

## How routing improves scalability

All post-auth routing decisions flow through a single module (`src/lib/onboarding/routing.ts`) and `ProfileService`:

```
Sign-in → resolvePostAuthRedirect(userId)
              ↓
        getOnboardingStatus(userId)
              ↓
        ProfileService.getProfile(userId)
              ↓
     has_profile → /dashboard
     no_profile  → /welcome
```

**Middleware** (`src/lib/supabase/middleware.ts`) applies the same rules at the edge for `/welcome` and `/dashboard` using a lightweight `profileExistsForUser` check.

**Layouts** (`(onboarding)/layout.tsx`, `(dashboard)/layout.tsx`) re-validate on the server via `getOnboardingStatus` for defense in depth.

**Server actions** (`checkOnboardingStatusAction`, `redirectAfterAuthAction`) expose status to client components without direct Supabase access.

Future onboarding steps (profile builder, profession selection, verification) can:

1. Reuse `OnboardingLayout`, `ProgressHeader`, `ProgressFooter`, and `ProgressIndicator`
2. Add new routes under `(onboarding)/` without changing auth
3. Redirect to `/dashboard` when `createProfile` succeeds — one change in `resolvePostAuthRedirect` consumers

## How onboarding state is determined

Onboarding status is derived from **profile existence**, not a separate flag:

| Status | Condition |
|--------|-----------|
| `no_profile` | `ProfileService.getProfile(userId)` returns `NOT_FOUND` |
| `has_profile` | `ProfileService.getProfile(userId)` returns a `Profile` |

```typescript
// src/lib/onboarding/routing.ts
export type OnboardingStatus = "no_profile" | "has_profile";
```

Database errors and network failures surface as `ok: false` with an error code. The welcome page shows retry UI; post-auth redirect falls back to `/welcome` on error (safe default: send user to onboarding entry).

## Routing flow

```mermaid
flowchart TD
  A[User signs in] --> B{Profile exists?}
  B -->|Yes| C[/dashboard]
  B -->|No| D[/welcome]
  D --> E[Future: Profile Builder]
  E --> F[Profile created]
  F --> C

  G[Authenticated user visits /welcome] --> H{Profile exists?}
  H -->|Yes| C
  H -->|No| D

  I[Authenticated user visits /dashboard] --> J{Profile exists?}
  J -->|Yes| C
  J -->|No| D
```

### Route groups

| Route | Group | Guard |
|-------|-------|-------|
| `/welcome` | `(onboarding)` | Auth required; redirect if profile exists |
| `/dashboard` | `(dashboard)` | Auth required; redirect if no profile |

### Post-auth redirect

`signInAction` calls `resolvePostAuthRedirect(userId)` after successful sign-in. Authenticated users hitting `/login` or other auth routes are redirected by middleware to `/welcome` or `/dashboard` using the same rules.

## Reusable onboarding components

Located in `src/components/onboarding/`:

| Component | Purpose |
|-----------|---------|
| `OnboardingLayout` | Centered card layout for wizard steps |
| `ProgressHeader` | Step title, description, and progress bar |
| `ProgressFooter` | CTA area and helper text |
| `ProgressIndicator` | Step N of M with percentage bar |

The welcome page uses step 1 of 6 as a placeholder for the full onboarding wizard in the Profile Builder phase.

## Loading and error states

The welcome page client (`WelcomePageClient`) handles:

| State | UI |
|-------|-----|
| Checking profile | `LoadingState` — “Checking profile…” |
| No profile | `WelcomeContent` with CTA |
| Has profile | Redirect to `/dashboard` |
| Error / network failure | `ErrorState` with retry |

## Future onboarding phases

1. **Profile Builder** — Wire “Create My Profile” to multi-step wizard; implement `ProfileService.createProfile`
2. **Profession & details** — Additional steps under `(onboarding)/`; increment `ProgressIndicator`
3. **Completion** — On success, redirect to `/dashboard`; middleware automatically blocks `/welcome`

## Future dashboard routing

`/dashboard` is a placeholder. When the dashboard is built:

- Keep the `(dashboard)` layout guard (profile required)
- Add sub-routes (`/dashboard/reviews`, `/dashboard/settings`) under the same group
- `isDashboardRoute` already matches `/dashboard/*`

Authentication, onboarding, and dashboard remain independent modules connected only through `getOnboardingStatus` and route constants in `ONBOARDING_ROUTES`.

## Key files

| File | Role |
|------|------|
| `src/lib/onboarding/routing.ts` | Status detection, redirect resolution, middleware helpers |
| `src/services/profiles/profile.service.ts` | `getProfile` for existence check |
| `src/app/actions/onboarding.actions.ts` | Server actions for client status checks |
| `src/app/actions/auth.actions.ts` | Post sign-in redirect |
| `src/lib/supabase/middleware.ts` | Edge guards for welcome/dashboard |
| `src/app/(onboarding)/welcome/page.tsx` | Welcome entry point |
| `src/app/(dashboard)/dashboard/page.tsx` | Dashboard placeholder |
