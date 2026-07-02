# TrustLoop Production Readiness

This document captures the engineering assessment, hardening work, and launch checklists for TrustLoop MVP deployment.

## Engineering Assessment (Pre-Hardening)

Findings were prioritized by launch risk. Items marked **Done** were addressed in this phase.

### Critical

| Finding | Why it matters | Status |
|--------|----------------|--------|
| No automated tests or CI | Regressions in auth, reviews, and admin flows would reach production undetected | **Done** — Vitest + GitHub Actions |
| No global error boundaries | Unhandled server/render failures expose blank screens | **Done** — `error.tsx`, `global-error.tsx` |
| Raw database errors returned to clients | Postgres messages can leak schema/table details | **Done** — `DatabaseError.fromSource()` |

### High

| Finding | Why it matters | Status |
|--------|----------------|--------|
| No Content-Security-Policy | XSS impact is broader without CSP | Open — add incrementally after auditing inline scripts |
| No rate limiting | Auth and review endpoints are abuse targets | Open — add at edge (Vercel/Cloudflare) or Supabase |
| Console-only observability | Production incidents are hard to triage | **Done** — monitoring abstraction + logger integration |
| Thin SEO surface | Poor discoverability for marketing and profiles | **Done** — metadata, robots, sitemap, JSON-LD |
| Post-login redirect not validated end-to-end | Open-redirect risk after auth | **Done** — `getSafeRedirectPath()` |

### Medium

| Finding | Why it matters | Status |
|--------|----------------|--------|
| Brand inconsistency (`meritt` vs TrustLoop) | User trust and support confusion | Open — rename package when convenient |
| No generated Supabase types | Schema drift causes runtime bugs | Open — `supabase gen types` in CI |
| Middleware + layout duplicate profile lookups | Extra latency on protected routes | Open — cache in request context |
| Missing default OG image asset | Social previews lack branding | Open — add `/public/images/og-default.png` |

### Low

| Finding | Why it matters | Status |
|--------|----------------|--------|
| Auth forms missing `aria-describedby` | Screen reader users miss error context | **Done** |
| Discovery tabs ARIA polish | Keyboard/AT navigation gaps | Open |

---

## Testing Strategy

### Stack

- **Vitest** — unit tests for pure logic (validators, analytics, routing, serialization)
- **GitHub Actions** — test and build on every PR/push to `main`

### Commands

```bash
npm run test           # single run
npm run test:watch     # watch mode
npm run test:coverage  # coverage report
```

### Coverage Areas

| Domain | What's tested | Location |
|--------|---------------|----------|
| Authentication | Sign-in/up/password Zod schemas | `src/lib/validators/auth.test.ts` |
| Profile creation | Slug + create profile schemas | `src/lib/validators/profile.test.ts` |
| Review creation | Create/leave review schemas | `src/lib/validators/reviews.test.ts` |
| Review requests | Request + token schemas | `src/lib/validators/reviews.test.ts` |
| Search | Param parsing, URL building, ilike escaping | `src/lib/search/params.test.ts`, `profile-search.query.test.ts` |
| Dashboard | Analytics computations | `src/services/dashboard/dashboard.analytics.test.ts` |
| Admin authorization | Admin list validators, DB error sanitization | `src/lib/admin/authorization.test.ts` |
| Route guards | Public/auth/admin route classification | `src/lib/auth/routes.test.ts` |
| Server action boundary | Serializable `ServiceResult` mapping | `src/lib/actions/serializable-result.test.ts` |
| Redirect safety | Open-redirect prevention | `src/lib/auth/safe-redirect.test.ts` |
| Error monitoring | Reporter delegation | `src/lib/monitoring/error-reporter.test.ts` |

### Recommended Next Tests (Post-Launch)

- Integration tests with Supabase local stack for RLS policies
- Playwright E2E for onboarding → profile → review happy path
- Contract tests for Server Actions with mocked services

---

## Security Checklist

### Done

- [x] RLS enabled on all core tables (migrations 001–016)
- [x] Admin defense-in-depth: middleware + layout + service + RLS
- [x] Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS (production)
- [x] `poweredByHeader: false`
- [x] Safe post-auth redirects (`getSafeRedirectPath`)
- [x] Client-safe database error messages
- [x] Logger redacts sensitive keys in production
- [x] Public env validation at startup (`src/instrumentation.ts`)
- [x] Serializable Server Action results (no `BaseError` class leakage)
- [x] JSON-LD XSS prevention (angle-bracket escaping in structured data)
- [x] Auth error messages sanitized (no raw Supabase/Postgres text to clients)
- [x] Review request resend authorization verified

### Before Launch

- [ ] Bootstrap first admin owner in Supabase:

```sql
INSERT INTO public.admin_users (user_id, role)
VALUES ('<auth-user-uuid>', 'owner');
```

- [ ] Set production env vars (see Deployment Checklist)
- [ ] Enable Supabase email rate limits and CAPTCHA for auth
- [ ] Review storage bucket policies for avatar uploads
- [ ] Configure custom domain + HTTPS
- [ ] Add edge rate limiting for `/login`, `/signup`, `/review/*`

### Post-Launch

- [ ] Add CSP after auditing third-party scripts
- [ ] Rotate Supabase service role key if ever exposed
- [ ] Periodic RLS policy audit
- [ ] Dependency vulnerability scanning (`npm audit`, Dependabot)

---

## Monitoring Strategy

### Error Reporting Abstraction

Location: `src/lib/monitoring/`

- `ErrorReporter` interface — vendor-agnostic
- `noopReporter` — default (no external calls)
- `reportError()` — called from `logger.error()`
- `setErrorReporter()` — register adapter at startup

### Sentry Integration Point

Uncomment and configure in `src/instrumentation.ts` when ready:

1. `npm install @sentry/nextjs`
2. Set `ERROR_REPORTING_DSN` in production env
3. Uncomment the Sentry block in `instrumentation.ts`

### Logging Guidelines

- **Development**: verbose `info` logs with full metadata
- **Production**: `warn`/`error` only; sensitive fields redacted
- **Never log**: passwords, tokens, session cookies, raw emails in bulk

---

## Performance Recommendations

### Current Optimizations

- `optimizePackageImports` for `lucide-react`
- Parallel `Promise.all` on search page (profiles + professions)
- Search indexes migration (`014_search_indexes.sql`)
- Image optimizer enabled in production (`unoptimized` only in dev)

### Recommended Improvements

| Area | Recommendation |
|------|----------------|
| Middleware | Cache `profileExistsForUser` per request to avoid duplicate queries with layouts |
| Search sitemap | Add dynamic profile URLs via scheduled job or ISR |
| Supabase types | Generate types to catch query mismatches at compile time |
| Bundle | Audit `/style-guide` — exclude from production nav or gate behind admin |
| Database | Monitor slow queries via Supabase dashboard; add indexes as traffic grows |

---

## Deployment Checklist

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key |
| `NEXT_PUBLIC_SITE_URL` | Yes (prod) | Canonical site URL, e.g. `https://trustloop.com` |
| `SUPABASE_DB_URL` | Migrations only | Session pooler URI for `npm run db:migrate` |
| `ERROR_REPORTING_DSN` | No | Sentry or compatible DSN |

Copy `.env.example` → `.env.local` for local development.

### Host Configuration (Vercel or similar)

1. Connect repository and set env vars
2. Node.js 22.x
3. Build command: `npm run build`
4. Output: Next.js default
5. Configure Supabase auth redirect URLs:
   - `https://<domain>/auth/callback`
6. Set `NEXT_PUBLIC_SITE_URL` to production domain

### Pre-Deploy Verification

```bash
npm run test
npm run build
npm run db:verify   # against target Supabase project
# npm run lint      # add once ESLint is configured
```

### Caching

- Public profile pages: `force-dynamic` (fresh reviews/ratings)
- Static marketing pages: prerendered at build
- Middleware: session refresh on every matched request

---

## SEO

### Implemented

- Root metadata: title template, Open Graph, Twitter cards, canonical URL
- `robots.txt` — blocks `/dashboard`, `/admin`, `/onboarding`, `/auth`
- `sitemap.xml` — static marketing routes
- Public profiles: canonical URLs, OG/Twitter metadata, Person + AggregateRating JSON-LD

### Future

- Dynamic sitemap entries for public profiles
- Default OG image asset
- `search` page metadata with `noindex` for filtered query pages (optional)

---

## Accessibility

### Implemented

- Auth forms: `aria-describedby`, `aria-invalid`, `role="alert"` on errors
- Password visibility toggle: `aria-label`
- Semantic headings in error boundaries

### Remaining

- Discovery/search tab keyboard patterns
- Focus management after onboarding step transitions
- Color contrast audit on warning/success alerts

---

## Launch Checklist

### T-7 Days

- [ ] All migrations applied to production Supabase
- [ ] Production env vars configured
- [ ] CI green on `main`
- [ ] Admin owner bootstrapped
- [ ] Auth redirect URLs configured in Supabase
- [ ] Email templates reviewed (verification, password reset)

### T-1 Day

- [ ] Smoke test: signup → verify → onboard → public profile
- [ ] Smoke test: leave review (direct + request token)
- [ ] Smoke test: search and dashboard
- [ ] Smoke test: admin panel access control
- [ ] Verify `robots.txt` and `sitemap.xml` on staging

### Launch Day

- [ ] Deploy production build
- [ ] Monitor error logs / reporting dashboard
- [ ] Verify HTTPS and security headers
- [ ] Test login redirect from protected route

### T+7 Days

- [ ] Review Supabase auth logs for abuse
- [ ] Check Core Web Vitals on key pages
- [ ] Gather first user feedback on onboarding friction

---

## Future Scaling Recommendations

1. **Edge rate limiting** — Cloudflare or Vercel Firewall for auth and review endpoints
2. **Read replicas** — if search/dashboard queries dominate, consider Supabase read replicas
3. **Background jobs** — review request expiry, email delivery, analytics aggregation
4. **Generated types** — `supabase gen types typescript` in CI
5. **E2E test suite** — Playwright against preview deployments
6. **Feature flags** — gradual rollout for post-MVP features
7. **CDN for avatars** — Supabase storage + CDN caching headers
8. **Observability** — Sentry + structured logging (Axiom, Datadog, etc.)

---

## Production Readiness Score

**Overall: 77 / 100**

| Area | Score | Notes |
|------|-------|-------|
| Security | 82 | RLS + headers + redirect safety + JSON-LD XSS fix + auth error sanitization; missing CSP and rate limits |
| Testing | 65 | Solid unit coverage; no E2E or RLS integration tests |
| Observability | 65 | Abstraction ready + error boundaries wired; vendor not connected |
| Performance | 70 | Indexed search; some duplicate middleware queries |
| SEO | 75 | Core metadata done; no dynamic sitemap or OG image |
| Accessibility | 68 | Auth improved; broader audit pending |
| Deployment | 80 | CI, env validation, docs, build verified |

---

## Remaining Risks

1. **No rate limiting** — brute-force and review spam remain possible
2. **No E2E tests** — cross-flow regressions may slip through
3. **CSP not configured** — XSS blast radius is larger than ideal
4. **Middleware profile checks** — extra DB round-trips under load
5. **Email deliverability** — depends on Supabase/custom SMTP configuration
6. **Single admin bootstrap** — manual SQL required; document for team

---

## Recommended Next Engineering Priorities (Post-Launch)

1. Wire Sentry (or equivalent) via `setErrorReporter()`
2. Add Playwright E2E for critical user journeys
3. Implement edge rate limiting on auth and review routes
4. Generate Supabase TypeScript types in CI
5. Add dynamic profile sitemap generation
6. Reduce duplicate profile lookups in middleware/layout
7. Add CSP with nonce-based script policy
8. Profile view tracking (dashboard placeholder exists)
