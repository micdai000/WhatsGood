# TrustLoop Engineering Audit

> Pre-release architecture review — June 2025  
> Scope: Full codebase audit without new features or flow changes

---

## Executive Summary

TrustLoop has a **solid foundation** for the implemented phases: typed services, Zod validation, Supabase RLS, and a working onboarding wizard. The codebase is in a **hybrid state** — TrustLoop auth/onboarding coexists with WhatsGood discovery features (mock data, Meritt styling). TypeScript hygiene is strong (strict mode, zero `any`).

This audit identified **3 high-severity security/correctness issues** (now fixed), several medium maintainability gaps, and documented technical debt for future phases.

---

## Scores

| Area | Score | Notes |
|------|-------|-------|
| **Overall Architecture** | **7/10** | Clear services layer for auth/profiles; discovery features bypass services |
| **Frontend** | **6/10** | Good onboarding UX; dual UI systems (TrustLoop vs Meritt) |
| **Backend** | **7/10** | ServiceResult pattern solid; error hierarchy was misaligned (fixed) |
| **Database** | **7/10** | RLS on core tables; some index/storage policy gaps |
| **Security** | **7/10** | Improved: open redirect, session verification, photo URL restriction |
| **Accessibility** | **6/10** | Onboarding strong; discovery pages lack tab semantics, labels |
| **Performance** | **6/10** | Triple profile query per dashboard request; large client pages |
| **Scalability** | **6/10** | Middleware profile check on every request; mock-driven features |
| **Maintainability** | **6/10** | Duplicated guards, styling, and legacy types |
| **Code Quality** | **7/10** | Consistent naming in services; dead code in discovery layer |

---

## Issues Found (Prioritized)

### High — Fixed in This Audit

| # | Issue | Location | Fix Applied |
|---|-------|----------|-------------|
| H1 | `handleServiceError` only recognized `ApplicationError`; `ValidationError`/`DatabaseError` became generic 500s | `src/services/shared.ts` | Now catches all `BaseError` subclasses |
| H2 | `getSession()` used cookie JWT without server verification | `src/services/auth/auth.service.ts` | Switched to `getUser()`; `refreshSession` enforces email verification |
| H3 | Open redirect via unvalidated `next` query param | `src/app/auth/callback/route.ts` | Added `sanitizeRedirectPath()` |
| H4 | `useOnboardingWizard` instantiated twice per step (shell + step) | Onboarding components | `OnboardingWizardProvider` context at `/onboarding` layout |
| H5 | `maximumScale: 1` disabled pinch-zoom (WCAG 1.4.4) | `src/app/layout.tsx` | Removed `maximumScale` |
| H6 | `ServiceResult.error` typed as `ApplicationError` but services return domain errors | `src/types/service-result.ts` | Typed as `BaseError` |

### High — Remaining

| # | Issue | Location | Recommendation |
|---|-------|----------|----------------|
| H7 | No CSP / HSTS headers (partial fix: basic headers added) | `next.config.ts` | Add CSP and HSTS in production deployment |
| H8 | Storage upload policies for `entity-images` / `library-covers` lack ownership checks | `010_create_storage.sql` | Add folder-ownership policies like `avatars` |
| H9 | Discovery pages are 100% client components with mock data | `search`, `profile`, `entity/[id]`, etc. | Migrate to services when DB-backed |

### Medium — Fixed in This Audit

| # | Issue | Fix Applied |
|---|-------|-------------|
| M1 | Arbitrary external URLs accepted as `profilePhoto` | `createProfileSchema` + `isAllowedProfilePhotoUrl()` |
| M2 | Generic `Error` messages leaked to clients via `mapUnknownAuthError` | Sanitized to generic message |
| M3 | `signOutAction` ignored failures | Checks `ServiceResult` before redirect |
| M4 | `completeOnboardingAction` bypassed profile check | Validates `has_profile` before redirect |
| M5 | Review services missing `server-only` | Added to review + review-request services |
| M6 | Global nav shown during onboarding wizard | `AppChrome` hides header/footer/nav on onboarding routes |
| M7 | `listProfiles` allowed invalid pagination | Bounds validation on page/limit |
| M8 | Duplicate `import "server-only"` | Removed from profession service |
| M9 | Library page type error (`Avatar` vs `UserAvatar`) | Fixed import for build correctness |

### Medium — Remaining

| # | Issue | Location |
|---|-------|----------|
| M10 | Triple profile DB query per dashboard request | middleware → layout → page |
| M11 | Middleware `profileExistsForUser` on every authenticated request | `src/lib/supabase/middleware.ts` |
| M12 | Auth guards in 4 layers (middleware + 3 layouts) | Redundant defense-in-depth |
| M13 | Dual UI systems: TrustLoop tokens vs Meritt `text-[#111]` / `page-x` | 12+ discovery files |
| M14 | Brand inconsistency: TrustLoop vs Meritt vs WhatsGood | metadata, copy, package name |
| M15 | Stale documentation | `backend-architecture.md`, `onboarding-architecture.md`, `database.md` |
| M16 | Legacy `Review`/`ReviewRequest` types without DB tables | `src/types/review*.ts` |
| M17 | No generated Supabase types; manual row casts | All services |
| M18 | `profile-check.ts` returns `false` on DB error (false negative) | Edge middleware |
| M19 | Session actions expose raw `ServiceResult` to client | `getSessionAction`, etc. |
| M20 | Discovery tab controls lack ARIA tab semantics | search, profile, libraries |

### Low — Remaining

| # | Issue |
|---|-------|
| L1 | Dead files: `home-hero.tsx`, `featured-entity-card.tsx`, `skeleton-presets.tsx`, `use-auth.ts` |
| L2 | `onboarding/index.ts` barrel unused |
| L3 | `password-input.tsx` `showStrength` prop is no-op |
| L4 | `logger.info` no-op in production |
| L5 | `shadcn` in production dependencies |
| L6 | No test framework |
| L7 | Slug rules in 3 places (validators, utils, client sanitize) |
| L8 | Entity routing helpers in `slug.ts` module |

---

## Fixes Applied (This Audit)

### Architecture & Security

1. **`handleServiceError`** — Recognizes all `BaseError` subclasses so validation failures return correct codes.
2. **`AuthService.getSession`** — Uses `getUser()` for verified identity; `refreshSession` checks email confirmation.
3. **`sanitizeRedirectPath`** — New utility; auth callback rejects external `next` URLs.
4. **`isAllowedProfilePhotoUrl`** — Profile photos must be from project Supabase `avatars` bucket.
5. **Security headers** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`; `poweredByHeader: false`.

### Onboarding

6. **`OnboardingWizardProvider`** — Single context for wizard state; eliminates duplicate hook instances.
7. **`AppChrome`** — Hides site header, footer, and bottom nav during onboarding routes.

### Code Quality

8. Pagination bounds, `signOut` error handling, `completeOnboarding` guard, `server-only` on stub services, unused import cleanup, photo input `htmlFor`/`id`, library avatar type fix.

---

## Area Reviews

### 1. Architecture

**Strengths:** Services layer for auth, profiles, professions; server actions as boundary; no Supabase in React components for TrustLoop features.

**Weaknesses:** WhatsGood discovery uses `@/data/mock` and client stores (`libraries-store`, `likes-store`) instead of services. `lib/onboarding/routing.ts` depends on `ProfileService` while middleware uses a parallel `profile-check.ts`.

### 2. Components

**Strengths:** Reusable onboarding shell (`OnboardingWizardShell`, `ProgressHeader`, `ProgressIndicator`). Design system components for auth.

**Weaknesses:** Two parallel styling systems. Duplicated Meritt input/filter styles across 6+ files. `EntityCard` vs inline search tiles.

### 3. Database

**Strengths:** FK cascades, denormalized counts via triggers, RLS on profiles/professions/avatars, vote uniqueness.

**Weaknesses:** Missing indexes on `user_follows(following_id)`, `activity(user_id)`. `libraries_created_count` not decremented on delete. Migration `011` not documented in `database.md`.

### 4. TypeScript

**Strengths:** `strict: true`, zero `any`, consistent `ServiceResult<T>`.

**Weaknesses:** No generated DB types; `CreateProfileInput` uses `slug`/`fullName` while `Profile` uses `username`/`displayName`. Legacy review types exported.

### 5. Validation

**Strengths:** Zod schemas for auth and profile creation; per-step onboarding schemas on client; server-side `createProfileSchema` on submit.

**Weaknesses:** Wizard state in localStorage can be tampered before submit (mitigated by server validation). MIME type trusted from client on upload (mitigated by storage bucket config).

### 6. Error Handling

**Strengths:** Shared error classes; `ServiceResult` everywhere in services; auth errors mapped to user-friendly messages.

**Weaknesses:** `DatabaseError` may expose raw Postgres messages. Inconsistent action result shapes (`AuthActionState` vs `ActionResult`).

### 7. Logging

**Strengths:** Sensitive key redaction in non-dev environments.

**Weaknesses:** Console-only; `info` disabled in production; no correlation IDs.

### 8. Accessibility

**Strengths:** Onboarding forms use labels, `aria-invalid`, progressbar roles. Password toggle labeled.

**Weaknesses:** Discovery filter tabs lack tab semantics. Search input unlabeled. No skip-to-content link.

### 9. Responsive Design

**Strengths:** Mobile-first onboarding; bottom nav with safe-area padding; responsive grid on review edit links.

**Weaknesses:** Some Meritt pages may overflow on small screens with fixed `h-12` inputs.

### 10. Performance

**Strengths:** `dynamic()` for below-fold home content; debounced slug availability checks; `optimizePackageImports` for lucide.

**Weaknesses:** Full client pages for discovery; middleware DB hit per request; style-guide loads entire UI kit.

### 11. Security

**Strengths:** RLS on profiles/storage; email verification gate; onboarding route guards; server-only services.

**Weaknesses:** Remaining CSP/HSTS gap; storage policies for non-avatar buckets; raw session actions to client.

---

## Technical Debt

| Category | Debt |
|----------|------|
| **Product** | WhatsGood mock data vs TrustLoop DB-backed profiles — two products in one repo |
| **Types** | Manual row mappers without generated Supabase types |
| **UI** | Meritt hardcoded colors vs shadcn design tokens |
| **Services** | Review/review-request stubs with validators but no implementation |
| **Infra** | No tests, no structured logging, no CI quality gates documented |
| **Docs** | 4 of 6 docs partially stale |

---

## Recommendations

### High Priority (Next Sprint)

1. Update stale documentation to match implemented auth, onboarding, and migration `011`.
2. Add storage ownership policies for `entity-images` and `library-covers`.
3. Deduplicate profile queries (middleware cookie flag or layout-only check).
4. Unify brand naming across metadata, copy, and env URLs.
5. Add CSP header appropriate for Supabase + Next.js.

### Medium Priority

6. Extract shared Meritt input/filter components to reduce Tailwind duplication.
7. Generate Supabase types (`supabase gen types typescript`).
8. Add ARIA tab semantics to discovery filter controls.
9. Remove dead code (`home-hero`, `featured-entity-card`, `skeleton-presets`, `use-auth.ts`).
10. Consolidate slug validation into single source of truth.

### Low Priority

11. Move `shadcn` to devDependencies.
12. Add Vitest for validators and services unit tests.
13. Strip unnecessary `"use client"` from presentational cards.
14. Add skip-to-content link in root layout.
15. Structured logging adapter for production.

### Future (Feature Phases)

- Migrate discovery features from mock data to services + DB
- Implement profile editing via `updateProfileSchema`
- Implement reviews when schema is restored
- Dashboard sub-routes with shared layout data fetching

---

## Files Changed in This Audit

| File | Change |
|------|--------|
| `src/services/shared.ts` | Fix `handleServiceError` for `BaseError` |
| `src/types/service-result.ts` | Type error as `BaseError` |
| `src/services/auth/auth.service.ts` | `getUser()` + email check on refresh |
| `src/lib/auth/safe-redirect.ts` | New — redirect sanitization |
| `src/app/auth/callback/route.ts` | Use safe redirect |
| `src/lib/validators/profile-photo.ts` | New — storage URL validation |
| `src/lib/validators/profile.ts` | Restrict `profilePhoto` URLs |
| `src/contexts/onboarding-wizard-context.tsx` | New — wizard provider |
| `src/app/(onboarding)/onboarding/layout.tsx` | New — provider wrapper |
| `src/components/layout/app-chrome.tsx` | New — conditional chrome |
| `src/app/layout.tsx` | AppChrome, remove zoom lock |
| `next.config.ts` | Security headers |
| `src/services/profiles/profile.service.ts` | Pagination bounds |
| `src/lib/auth/map-auth-error.ts` | Sanitize generic errors |
| `src/app/actions/auth.actions.ts` | Sign-out error handling |
| `src/app/actions/onboarding.actions.ts` | Complete onboarding guard |
| `src/services/reviews/*.ts` | `server-only` |
| `src/services/reviewRequests/*.ts` | `server-only` |
| `src/services/professions/profession.service.ts` | Remove duplicate import |
| `src/app/library/[id]/page.tsx` | Fix avatar type error |
| Onboarding step components | Remove duplicate hook usage |

---

## Conclusion

The TrustLoop core (auth → onboarding → profile creation → dashboard) is **production-viable** with the fixes applied in this audit. The WhatsGood discovery layer remains **prototype-quality** (mock data, client-heavy pages, inconsistent styling) and should not block TrustLoop release if scoped separately.

**Recommended gate for production:** Deploy with migration `011`, verify RLS policies, apply remaining security headers at CDN/platform level, and update documentation before external users onboard.
