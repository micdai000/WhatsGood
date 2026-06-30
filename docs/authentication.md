# TrustLoop — Authentication

> For engineers joining the project.  
> Stack: Supabase Auth + Next.js 15 App Router + Services Layer

---

## Overview

Authentication is handled entirely through **AuthService** (`src/services/auth/auth.service.ts`). React components never call Supabase directly — they invoke **Server Actions** in `src/app/actions/auth.actions.ts`, which validate input and delegate to AuthService.

**Auth is separate from profiles.** Signing up creates a Supabase `auth.users` record only. The `profiles` table (Phase 5 onboarding) is created later after email verification and onboarding — not during sign-up.

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Auth Pages     │────▶│  Server Actions  │────▶│   AuthService   │
│  (components)   │     │  auth.actions.ts │     │  auth.service.ts│
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                        ┌──────────────────┐              │
                        │  Middleware      │◀─────────────┤
                        │  (route guard)   │   cookies    │
                        └──────────────────┘              ▼
                                               ┌─────────────────┐
                                               │ Supabase Auth   │
                                               │ (via SSR client)│
                                               └─────────────────┘
```

---

## Supabase Auth

Supabase provides:

- Email/password authentication
- Email verification
- Password reset flows
- Session tokens stored in HTTP-only cookies (via `@supabase/ssr`)

AuthService wraps all `supabase.auth.*` calls and maps responses to `ServiceResult<T>`.

---

## Session Lifecycle

1. **Sign up** — Account created; verification email sent. User is **not** signed in.
2. **Verify email** — User clicks link → `/auth/callback` → email confirmed → redirect to `/login`.
3. **Sign in** — Credentials validated; session cookie set only if email is verified.
4. **Middleware** — On every request, `getUser()` refreshes the session token.
5. **Protected layout** — `(protected)/layout.tsx` loads session server-side and provides `AuthProvider`.
6. **Sign out** — Session cookie cleared; redirect to `/login`.

### Session persistence

Sessions persist across page refreshes via Supabase SSR cookie handling in:

- `src/lib/supabase/server.ts` — Server Components & Actions
- `src/lib/supabase/middleware.ts` — Token refresh on navigation
- `src/lib/supabase/client.ts` — Browser client (hooks refresh via server actions)

---

## Cookies

`@supabase/ssr` manages auth cookies automatically. Do not manually set auth tokens.

| Layer | Role |
|-------|------|
| Middleware | Refreshes session; redirects unauthenticated users |
| Server client | Reads/writes cookies in Server Actions |
| Browser client | Available for future client-side patterns (not used in components today) |

---

## Protected Routes

### Public (no auth required)

| Route | Purpose |
|-------|---------|
| `/` | Homepage |
| `/about` | About page |
| `/pricing` | Pricing page |
| `/login` | Sign in |
| `/signup` | Create account |
| `/forgot-password` | Request reset email |
| `/reset-password` | Set new password (requires recovery session) |
| `/auth/callback` | Email verification & recovery handler |
| `/@username` | Future public profiles |

### Protected (auth required)

Everything else, including:

- `/profile`, `/create`, `/search`, `/libraries`, `/entity/*`, `/style-guide`

Unauthenticated access redirects to `/login?redirect=<original-path>`.

### Enforcement layers

1. **Middleware** (`src/middleware.ts`) — First line of defense
2. **Protected layout** (`src/app/(protected)/layout.tsx`) — Server-side session check + `AuthProvider`

---

## AuthService Methods

| Method | Description |
|--------|-------------|
| `signUp(input)` | Create account; sign out immediately; no auto-login |
| `signIn(input)` | Sign in; requires verified email |
| `signOut()` | Clear session |
| `resetPassword(input)` | Send password reset email |
| `updatePassword(input)` | Set new password (recovery session) |
| `verifyEmail(tokenHash)` | Confirm email via OTP |
| `getCurrentUser()` | Get authenticated user or null |
| `getSession()` | Get session with expiry |
| `refreshSession()` | Refresh tokens |

All return `ServiceResult<T>`.

---

## Server Actions

| Action | Used by |
|--------|---------|
| `signUpAction` | Sign up form |
| `signInAction` | Login form |
| `signOutAction` | Sign out button (future) |
| `resetPasswordAction` | Forgot password form |
| `updatePasswordAction` | Reset password form |
| `getSessionAction` | Auth hooks |
| `getCurrentUserAction` | Auth hooks |
| `refreshSessionAction` | Auth hooks |

---

## Client Hooks

Located in `src/hooks/use-auth.ts`. Require `AuthProvider` (mounted in protected layout).

| Hook | Purpose |
|------|---------|
| `useSession()` | Current session + refresh |
| `useCurrentUser()` | Current user + refresh |
| `useRequireAuth()` | Redirect to `/login` if unauthenticated |

---

## Email Verification Flow

```
Sign up
  ↓
Supabase sends verification email
  ↓
User clicks link → /auth/callback?code=...&type=signup
  ↓
Code exchanged; session immediately cleared
  ↓
Redirect to /login?verified=true
  ↓
User signs in with verified email
```

Users are **never** automatically signed in before verification.

---

## Password Reset Flow

```
Forgot password form
  ↓
resetPasswordAction → email sent
  ↓
User clicks link → /auth/callback?type=recovery&code=...
  ↓
Recovery session established
  ↓
Redirect to /reset-password
  ↓
updatePasswordAction → password updated
  ↓
User signs in at /login
```

---

## Error Handling

Supabase errors are mapped in `src/lib/auth/map-auth-error.ts`:

| Code | User message |
|------|-------------|
| `INVALID_CREDENTIALS` | Invalid email or password |
| `CONFLICT` | Email already exists |
| `VALIDATION_ERROR` | Weak password / invalid input |
| `AUTHORIZATION_ERROR` | Email not verified |
| `EXPIRED_TOKEN` | Reset/verification link expired |
| `NETWORK_ERROR` | Connection issue |

Displayed via `AuthFormError` / `AuthFormSuccess` components.

---

## Auth UI Components

Located in `src/components/auth/`:

| Component | Purpose |
|-----------|---------|
| `AuthCard` | Centered auth card shell |
| `LoginForm` | Sign in form |
| `SignUpForm` | Registration form |
| `ForgotPasswordForm` | Reset request form |
| `ResetPasswordForm` | New password form |
| `PasswordInput` | Password field with visibility toggle |
| `PasswordStrengthIndicator` | Visual strength meter |
| `RememberMeCheckbox` | Remember me (UI; session uses SSR cookies) |
| `OAuthButton` | Placeholder for future OAuth |
| `AuthDivider` | "or" separator |

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Required for email redirect URLs
```

Configure matching redirect URLs in Supabase Dashboard → Authentication → URL Configuration.

---

## Future: Onboarding & Profiles

After authentication (Phase 5):

1. User signs in → middleware allows access to protected routes
2. Protected layout checks for `profiles` row (future `ProfileService`)
3. If no profile → redirect to `/onboarding`
4. Onboarding creates `profiles` row linked to `auth.users.id`

AuthService does **not** create profile rows. That remains ProfileService's responsibility.

---

## Do Not

- Call `supabase.auth` from React components
- Create `profiles` rows in sign-up flow
- Auto-login users before email verification
- Store tokens in `localStorage`
- Bypass AuthService for auth operations
