# Profile Editing & Account Settings

Professionals can update their public profile and manage account credentials after onboarding. This phase adds profile editing and account settings without redesigning onboarding or adding notifications, messaging, or admin tools.

## Why editing reuses onboarding logic

Onboarding and editing collect the **same fields** with the **same validation rules**. Duplicating forms would drift over time — one path might allow bios the other rejects, or slug rules could diverge.

TrustLoop extracts shared field components (`DisplayNameField`, `ProfessionField`, `UsernameField`, etc.) used by:

- Onboarding wizard steps (multi-step first-time setup)
- Edit profile form (single-page update)

Validators (`createProfileSchema`, `onboarding*Schema`) remain the single source of truth for field rules.

## Why ProfileService owns profile updates

`ProfileService` is the boundary for all profile data access:

| Concern | Owner |
|---------|--------|
| Field validation | Zod schemas → `ProfileService.updateProfile()` |
| Owner authorization | Service compares session user ID to profile ID |
| Slug availability | `checkSlugAvailability(slug, excludeUserId)` |
| Database writes | Supabase `profiles` update |
| Photo storage cleanup | `deleteAvatarByUrl()` after successful replace |

React components and server actions never call Supabase directly for profile updates.

## Account settings vs profile information

| Area | Route | Data |
|------|-------|------|
| **Profile** | `/dashboard/profile/edit` | Public identity: name, username, bio, photo, location, profession |
| **Account** | `/dashboard/settings` | Auth credentials: email (read-only), password, sign out, delete account |

Keeping these separate avoids mixing auth operations with public profile fields and clarifies what clients see vs what is private account data.

## Architecture

```
/dashboard/profile/edit (Server Component)
        │
        ├── profileService.getProfile(userId)
        ├── profileService.getPublicProfile(username)  → preview stats
        └── professionService.getProfessions()
        │
        ▼
EditProfileForm (Client Component)
        │
        ├── Shared profile-fields components
        ├── PublicProfilePreview (ProfileHeader, ProfileStats, ProfileBio)
        └── updateProfileAction → profileService.updateProfile()
        │
        ▼
revalidatePath(/u/[slug], /dashboard, /search)

/dashboard/settings
        │
        ├── Email (display only)
        ├── ChangePasswordForm → updatePasswordAction
        ├── SignOutButton → signOutAction
        └── DeleteAccountDialog → deleteAccountAction
```

## Profile update flow

1. User edits fields in `EditProfileForm`
2. Live preview updates via `mapProfileToPublicProfile()`
3. On submit:
   - Client validates with `createProfileSchema`
   - If username changed, `checkSlugAvailabilityAction` confirms availability
   - `updateProfileAction` validates again server-side and calls `ProfileService.updateProfile()`
4. Service verifies session user owns the profile
5. Partial DB update (only provided fields)
6. If avatar URL changed, old storage object is removed
7. Paths revalidated; public profile reflects changes immediately

## Slug validation

- Format: lowercase letters, numbers, hyphens (`profileSlugSchema`)
- Availability: `checkSlugAvailability(slug, excludeUserId)` treats the user's current slug as available
- Unchanged slug: no duplicate check conflict
- Changed slug: uniqueness verified before save; `23505` DB constraint as fallback

## Photo replacement

1. `uploadProfilePhotoAction` → `ProfileService.uploadProfilePhoto()` stores in `avatars/{userId}/`
2. Edit form holds preview URL locally before save
3. On successful profile update with a new `profilePhoto` URL, `deleteAvatarByUrl()` removes the previous file if unreferenced

## Account settings

### Email

Displayed read-only. Changing email in Supabase requires verification flows that are not yet wired in-app — documented as a future enhancement rather than a fragile partial implementation.

### Change password

Reuses `updatePasswordSchema` and `AuthService.updatePassword()` via `updatePasswordAction`.

### Sign out

`signOutAction` clears session and redirects to `/login`.

### Delete account

1. User types `DELETE` in confirmation dialog
2. `deleteAccountAction` removes avatar storage files
3. `delete_own_account` RPC deletes `auth.users` row (cascades to `profiles`, reviews, requests)
4. Session cleared; redirect to `/login?deleted=1`

Migration: `015_delete_own_account.sql`

## UX

- **Loading:** `loading.tsx` skeletons on edit and settings routes
- **Success:** `StatusAlert` after profile save or password update
- **Validation:** Field-level errors from Zod; slug availability inline
- **Unsaved changes:** `beforeunload` warning + confirm on Cancel when dirty

## Accessibility

- Labels on all inputs; `aria-invalid` and `role="alert"` for errors
- `aria-busy` during submit; keyboard-accessible form controls
- Alert dialog for destructive delete with confirmation input
- Responsive two-column layout (form + sticky preview on large screens)

## File layout

| Path | Role |
|------|------|
| `src/services/profiles/profile.service.ts` | `updateProfile`, storage cleanup |
| `src/services/auth/auth.service.ts` | `deleteAccount` |
| `src/app/actions/profile.actions.ts` | `updateProfileAction` |
| `src/app/actions/auth.actions.ts` | `deleteAccountAction`, password, sign out |
| `src/components/profile-fields/*` | Shared field UI |
| `src/components/profile/edit-profile-form.tsx` | Edit page form + preview |
| `src/components/profile/public-profile-preview.tsx` | Live preview shell |
| `src/components/settings/*` | Account settings UI |
| `src/app/(dashboard)/dashboard/profile/edit/page.tsx` | Edit route |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | Settings route |

## Future enhancements

- **Email change** — in-app flow with Supabase email verification
- **Two-factor authentication**
- **Session management** — view/revoke active sessions
- **Username redirects** — redirect old `@username` URLs after slug change
- **Profile visibility** — pause public profile without deleting account

## Usage

```ts
import { profileService } from "@/services/profiles";

const result = await profileService.updateProfile(userId, {
  fullName: "Jane Coach",
  slug: "jane-coach",
  professionId: "...",
  city: "Austin",
  state: "TX",
});
```

All profile updates must go through `ProfileService` — never query Supabase from components.
