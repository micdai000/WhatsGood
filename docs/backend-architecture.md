# TrustLoop — Backend Architecture

> For backend engineers joining the project.  
> Stack: Next.js 15 Server Actions / API Routes → Services Layer → Supabase

---

## Overview

TrustLoop uses a **Services Layer** pattern. All business logic lives in `src/services/`. React components, API routes, and Server Actions never talk to Supabase directly — they call services and handle `ServiceResult` responses.

This document describes the foundation built in Phase 3. Services are **stubbed** — method signatures and architecture exist; database wiring comes in later phases.

---

## Why a Services Layer?

| Without services | With services |
|----------------|---------------|
| Supabase queries scattered across 20+ components | One place per domain (`ProfileService`, `ReviewService`) |
| Business rules duplicated or inconsistent | Rules enforced once |
| Hard to test | Services testable in isolation |
| Auth changes break many files | Auth injected at service boundary |

---

## Folder Structure

```
src/
├── services/                 # Business logic (domain-owned)
│   ├── auth/
│   │   ├── auth.service.ts
│   │   └── index.ts
│   ├── profiles/
│   ├── reviews/
│   ├── reviewRequests/
│   ├── professions/
│   ├── shared.ts             # Result helpers, error handling
│   └── index.ts              # Barrel export
│
├── types/                    # Shared TypeScript interfaces
│   ├── profile.ts
│   ├── review.ts
│   ├── review-request.ts
│   ├── profession.ts
│   ├── auth.ts
│   ├── service-result.ts
│   ├── pagination.ts
│   ├── api.ts
│   └── index.ts
│
├── lib/
│   ├── errors/               # Typed application errors
│   ├── validators/           # Zod schemas + validate()
│   ├── constants/            # App-wide constants
│   ├── logger/               # Structured logging
│   ├── utils/                # Pure helper functions
│   └── supabase/             # Supabase clients (infra only)
```

---

## Service Layer Philosophy

### Single responsibility

Each service owns **one domain**:

| Service | Responsibility |
|---------|----------------|
| `AuthService` | Sign up, sign in, sign out, password reset, session |
| `ProfileService` | CRUD for professional profiles |
| `ReviewService` | Reviews, ratings, averages |
| `ReviewRequestService` | Review invitation links and status |
| `ProfessionService` | Profession lookup data |

### Components never call Supabase

```
❌  Component → supabase.from('profiles').select()
✅  Component → profileService.getProfile(id)
✅  API Route  → profileService.getProfile(id)
✅  Server Action → profileService.updateProfile(id, input)
```

Supabase clients in `src/lib/supabase/` are **infrastructure**. Only services import them (in future phases).

---

## ServiceResult Pattern

Every service method returns `ServiceResult<T>` — never throws to callers.

```typescript
type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApplicationError };
```

### Usage

```typescript
import { profileService } from "@/services";
import { isSuccess } from "@/types";

const result = await profileService.getProfileBySlug("jane-tutor");

if (isSuccess(result)) {
  console.log(result.data.fullName);
} else {
  console.error(result.error.code, result.error.message);
}
```

### Helpers

```typescript
import { success, failure, isSuccess, isFailure } from "@/types";
import { handleServiceError, notImplemented } from "@/services";
```

---

## Error Handling

All errors extend `BaseError` in `src/lib/errors/`:

| Class | HTTP | When to use |
|-------|------|-------------|
| `ValidationError` | 400 | Invalid input (Zod failures) |
| `AuthorizationError` | 403 | User lacks permission |
| `NotFoundError` | 404 | Resource doesn't exist |
| `ConflictError` | 409 | Duplicate slug, already reviewed |
| `DatabaseError` | 500 | Supabase/PostgreSQL failures |
| `ApplicationError` | * | Generic / catch-all |

Services return these inside `ServiceResult.failure()`, not as thrown exceptions.

---

## Validation

Zod schemas live in `src/lib/validators/`. Use `validate()` or `safeValidate()` before calling service logic.

```typescript
import { createProfileSchema, validate } from "@/lib/validators";

const input = validate(createProfileSchema, rawInput);
await profileService.createProfile(input);
```

Schemas exist for: profile, review, review request, auth, profession.

---

## Constants

`src/lib/constants/index.ts` — single source of truth for:

- Pagination defaults (`DEFAULT_PAGE`, `DEFAULT_LIMIT`, `MAX_LIMIT`)
- Rating bounds (`MIN: 1`, `MAX: 5`)
- Field length limits
- Default avatar URL
- Review request expiry

Never hardcode magic numbers in services or components.

---

## Logging

```typescript
import { logger } from "@/lib/logger";

logger.info("ProfileService.createProfile", { userId });
logger.warn("Review request expired", { requestId });
logger.error("ProfileService.getProfile", error, { id });
```

- **Development:** verbose `info` logs with full metadata
- **Production:** sensitive fields (`email`, `password`, `token`) redacted automatically

---

## Services API Reference (Stubs)

### ProfileService

| Method | Returns |
|--------|---------|
| `getProfile(id)` | `ServiceResult<Profile>` |
| `getProfileBySlug(slug)` | `ServiceResult<Profile>` |
| `createProfile(input)` | `ServiceResult<Profile>` |
| `updateProfile(id, input)` | `ServiceResult<Profile>` |
| `deleteProfile(id)` | `ServiceResult<void>` |
| `listProfiles(params?)` | `ServiceResult<PaginatedResult<Profile>>` |

### ReviewService

| Method | Returns |
|--------|---------|
| `getReview(id)` | `ServiceResult<Review>` |
| `getReviews(profileId, params?)` | `ServiceResult<PaginatedResult<Review>>` |
| `createReview(input)` | `ServiceResult<Review>` |
| `getAverageRating(profileId)` | `ServiceResult<{ average, total }>` |
| `deleteReview(id)` | `ServiceResult<void>` |

### ReviewRequestService

| Method | Returns |
|--------|---------|
| `getRequest(id)` | `ServiceResult<ReviewRequest>` |
| `getRequestsByProfile(profileId)` | `ServiceResult<PaginatedResult<ReviewRequest>>` |
| `createRequest(input)` | `ServiceResult<ReviewRequest>` |
| `resendRequest(id)` | `ServiceResult<ReviewRequest>` |
| `completeRequest(token)` | `ServiceResult<ReviewRequest>` |
| `expireRequest(id)` | `ServiceResult<ReviewRequest>` |

### ProfessionService

| Method | Returns |
|--------|---------|
| `getProfessions()` | `ServiceResult<Profession[]>` |
| `getProfession(id)` | `ServiceResult<Profession>` |
| `getProfessionBySlug(slug)` | `ServiceResult<Profession>` |

### AuthService

| Method | Returns |
|--------|---------|
| `signUp(input)` | `ServiceResult<AuthUser>` |
| `signIn(input)` | `ServiceResult<AuthUser>` |
| `signOut()` | `ServiceResult<void>` |
| `resetPassword(input)` | `ServiceResult<void>` |
| `getSession()` | `ServiceResult<AuthUser \| null>` |
| `verifyEmail(token)` | `ServiceResult<void>` |

All methods currently return `{ success: false, error: NOT_IMPLEMENTED }`.

---

## Future: API Routes

```typescript
// src/app/api/profiles/[slug]/route.ts
import { profileService } from "@/services";
import { isSuccess } from "@/types";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const result = await profileService.getProfileBySlug(params.slug);

  if (!isSuccess(result)) {
    return Response.json(
      { error: { code: result.error.code, message: result.error.message } },
      { status: result.error.statusCode },
    );
  }

  return Response.json({ data: result.data });
}
```

---

## Future: Server Actions

```typescript
"use server";

import { profileService } from "@/services";
import { updateProfileSchema, validate } from "@/lib/validators";
import { isFailure } from "@/types";

export async function updateProfileAction(id: string, formData: FormData) {
  const input = validate(updateProfileSchema, Object.fromEntries(formData));
  const result = await profileService.updateProfile(id, input);

  if (isFailure(result)) {
    return { error: result.error.message };
  }

  return { data: result.data };
}
```

---

## Future: Authentication Integration

When Phase 4 lands:

1. `AuthService` wires to `supabase.auth`
2. Services receive `userId` from session via a `getAuthenticatedUser()` helper
3. `AuthorizationError` thrown when `auth.uid() !== profile.ownerId`
4. Middleware already refreshes sessions via `src/lib/supabase/middleware.ts`

No changes to component architecture — only service internals.

---

## Adding a New Feature

1. Define types in `src/types/`
2. Add Zod schema in `src/lib/validators/`
3. Add methods to the relevant service
4. Return `ServiceResult<T>` from every method
5. Wire from API route or Server Action — never from a React component directly

---

## Do Not

- Import `@/lib/supabase/*` from components or pages
- Throw raw `Error` from services — use typed errors + `ServiceResult`
- Duplicate validation logic outside Zod schemas
- Skip logging on error paths in service implementations
