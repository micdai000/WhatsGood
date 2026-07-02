# Admin Panel & Moderation

TrustLoop's admin panel is an **internal tool** for platform operators. It provides secure moderation, profession management, and platform analytics without mixing authorization data into public profiles.

> This is not a customer-facing feature. Regular users and professionals never see admin UI.

## Authentication vs authorization

| Concept | Question | TrustLoop implementation |
|---------|----------|--------------------------|
| **Authentication** | Who are you? | Supabase Auth session (`authService.getSession()`) |
| **Authorization** | What may you do? | `admin_users` table + `requireAdmin()` / `requireOwner()` |

Signing in proves identity. Being signed in does **not** grant admin access. Authorization is checked separately on every admin request.

## Why admin permissions are separate from profiles

`profiles` is **public professional information** — visible in search, readable by anyone. Storing admin roles there would:

- Expose role data in public queries
- Couple moderation permissions to profile lifecycle
- Complicate RLS (public read vs private role)

`admin_users` is the **sole source of truth** for administrator permissions:

```sql
admin_users (
  user_id    → auth.users(id),
  role       → 'owner' | 'admin',
  created_at,
  created_by → nullable, future use
)
```

Profiles remain public. Authorization remains private.

## Defense in depth

Authorization is enforced at three layers:

1. **Middleware** — blocks `/admin/*` for unauthenticated users and non-admins (redirect to login or dashboard)
2. **Layout** — `requireAdmin()` in `(admin)/admin/layout.tsx` (server-side gate)
3. **AdminService** — every method calls `assertAdmin()` before database operations
4. **RLS** — `admin_users` and `audit_logs` readable only by admins; destructive policies on reviews/profiles require `is_admin()`

Never trust the frontend. Client components trigger server actions; services re-verify permissions.

## Scaling to multiple administrators

| Role | Capabilities |
|------|----------------|
| **owner** | Full admin access + add/remove admins (cannot remove owners or self via RLS) |
| **admin** | Read admin data, moderate content, manage professions, write audit logs |

Add administrators by inserting into `admin_users` (owners only, enforced by RLS):

```sql
INSERT INTO public.admin_users (user_id, role, created_by)
VALUES ('<auth-user-uuid>', 'admin', '<owner-user-uuid>');
```

No hardcoded emails. No profile columns. New roles (e.g. `moderator`, `support`) can be added by extending the `role` check constraint and authorization helpers.

## Authorization helpers

**File:** `src/lib/admin/authorization.ts`

| Helper | Purpose |
|--------|---------|
| `getCurrentAdmin()` | Returns `AdminUser` or `null` |
| `isAdmin(userId?)` | Boolean check |
| `isOwner(userId?)` | Boolean owner check |
| `requireAdmin()` | `ServiceResult<AdminUser>` — fails with `AuthorizationError` |
| `requireOwner()` | Owner-only variant |
| `checkAdminInMiddleware()` | Used by edge middleware |

## Middleware flow

```
Request → /admin/*
    │
    ├─ No session → redirect /login?redirect=/admin/...
    │
    ├─ Session + not in admin_users → redirect /dashboard
    │
    └─ Session + admin → continue → layout requireAdmin() → AdminService
```

**Files:** `src/middleware.ts`, `src/lib/supabase/middleware.ts`, `src/lib/admin/routes.ts`

## RLS policies

Migration: `016_admin_and_audit.sql`

### `admin_users`
- **SELECT** — `is_admin()`
- **INSERT** — `is_owner()` (admins or first owner bootstrap)
- **DELETE** — `is_owner()` AND target `role = 'admin'` AND `user_id <> auth.uid()`

### `audit_logs`
- **SELECT** — `is_admin()`
- **INSERT** — `is_admin()` AND `admin_id = auth.uid()`

### Content moderation
- **reviews DELETE** — profile owner OR `is_admin()`
- **profiles DELETE** — `is_admin()` (service blocks owner accounts)
- **professions INSERT/UPDATE** — `is_admin()`

### Helper functions
- `is_admin()` — SECURITY DEFINER, checks `admin_users`
- `is_owner()` — SECURITY DEFINER, checks `role = 'owner'`

## AdminService

**File:** `src/services/admin/admin.service.ts`

All admin database operations go through `AdminService`. No Supabase calls in React components.

| Method | Purpose |
|--------|---------|
| `getDashboard()` | Platform statistics + recent activity |
| `getUsers()` | Paginated auth users (via `admin_list_users` RPC) |
| `getProfiles()` | Searchable profile list |
| `getReviews()` | Searchable reviews (newest first) |
| `getProfessions()` | All professions including disabled |
| `createProfession()` | Create + audit log |
| `updateProfession()` | Edit / disable + audit log |
| `deleteReview()` | Moderate + audit log |
| `deleteProfile()` | Moderate + audit log (blocks owners and self) |

## Audit logging

**Table:** `audit_logs`

| Column | Purpose |
|--------|---------|
| `admin_id` | Who performed the action |
| `action` | e.g. `review.deleted`, `profession.created` |
| `entity_type` | `review`, `profile`, `profession` |
| `entity_id` | Target record ID |
| `metadata` | JSON context (names, slugs, etc.) |
| `created_at` | Timestamp |

Every destructive admin action writes to `audit_logs` via `writeAuditLog()` in `src/services/admin/admin.audit.ts`. Audit logs are not exposed publicly.

## Admin routes

| Route | Features |
|-------|----------|
| `/admin` | Platform stats, quick actions, recent activity |
| `/admin/users` | Search, pagination, email, role, profile link |
| `/admin/profiles` | Search, view, delete (confirmation) |
| `/admin/reviews` | Search, newest first, delete (confirmation) |
| `/admin/professions` | Create, edit, disable, duplicate name prevention |

## Bootstrapping the first owner

After running `npm run db:migrate`, promote your account manually:

```sql
INSERT INTO public.admin_users (user_id, role)
VALUES ('<your-auth-user-uuid>', 'owner');
```

Find your user ID in Supabase Dashboard → Authentication → Users.

## Authorization flow (login → admin page)

1. User signs in → Supabase session cookie set
2. User navigates to `/admin`
3. **Middleware** refreshes session, queries `admin_users` for `user.id`
4. Non-admin → redirect `/dashboard`
5. Admin → request continues to `(admin)/admin/layout.tsx`
6. **Layout** calls `requireAdmin()` (second server-side check)
7. **Page** calls `adminService.getDashboard()` → `assertAdmin()` (third check)
8. **RLS** ensures queries only succeed for admin session

## Future roles

To add `moderator` or `support`:

1. Extend `admin_users.role` CHECK constraint
2. Add `is_moderator()` helper or role hierarchy in `requireRole()`
3. Scope AdminService methods by role (e.g. moderators: reviews only)
4. Add RLS policies per role as needed

The separate `admin_users` table and helper pattern avoid refactoring profiles or auth metadata.

## Why this design is production-ready

- **No hardcoded admins** — database-driven, auditable grants
- **Separation of concerns** — public profiles vs private authorization
- **Defense in depth** — middleware + layout + service + RLS
- **Audit trail** — destructive actions logged with metadata
- **Owner protection** — RLS and service logic prevent deleting owners
- **Extensible roles** — new roles without schema changes to `profiles`
- **Typed service layer** — `ServiceResult`, validators, logger throughout

## File layout

| Path | Role |
|------|------|
| `supabase/migrations/016_admin_and_audit.sql` | Schema, RLS, RPCs |
| `src/lib/admin/authorization.ts` | Auth helpers |
| `src/lib/admin/routes.ts` | Route matching |
| `src/services/admin/` | AdminService + audit |
| `src/app/actions/admin.actions.ts` | Server actions |
| `src/app/(admin)/admin/` | Admin pages + layout |
| `src/components/admin/` | Admin UI components |
| `src/types/admin.ts` | Admin types |
