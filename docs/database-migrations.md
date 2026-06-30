# Database Migrations

TrustLoop uses SQL migrations in `supabase/migrations/`. Migrations must be applied to your Supabase project before onboarding will work.

---

## Onboarding requires migration `011`

The profession step queries `public.professions`. Migration `011_create_professions.sql` creates:

| Object | Purpose |
|--------|---------|
| `public.professions` | Profession lookup table (seeded with 8 professions) |
| `profiles.profession_id` | FK to selected profession |
| `profiles.city` | Location (onboarding) |
| `profiles.state` | Location (onboarding) |
| RLS policy | Public read on `professions` |

**If this migration is not applied**, onboarding Step 2 fails with:

```
Could not find the table 'public.professions' in the schema cache
```

---

## Verify your database

```bash
npm run db:verify
```

Checks (via Supabase REST API, no DB password needed):

- `public.professions` exists and is readable
- `profiles.profession_id`, `city`, `state` columns exist
- Profession seed data is present

---

## Apply migrations

### Option A — npm script (recommended)

1. Add your database connection string to `.env.local`:

```env
SUPABASE_DB_URL=postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres
```

Find this in **Supabase Dashboard → Project Settings → Database → Connection string → URI**.

2. Run:

```bash
npm run db:migrate
```

This applies any unapplied `.sql` files in order and re-runs `npm run db:verify`.

### Option B — Supabase SQL Editor

1. Open **Supabase Dashboard → SQL Editor**
2. Paste the contents of `supabase/migrations/011_create_professions.sql`
3. Click **Run**
4. Confirm with `npm run db:verify`

### Option C — Supabase CLI

```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

Requires the Supabase CLI and your database password.

---

## Migration order

| File | Description |
|------|-------------|
| `000_reset_legacy_schema.sql` | Drops legacy TrustLoop tables (fresh installs only) |
| `001_create_profiles.sql` | User profiles |
| `002`–`010` | WhatsGood entities, votes, libraries, storage |
| **`011_create_professions.sql`** | **Professions + onboarding profile columns** |

---

## RLS

Migration `011` enables RLS on `professions` with a public read policy:

```sql
CREATE POLICY "Professions are publicly readable"
  ON public.professions FOR SELECT
  USING (true);
```

Authenticated and anonymous users can read professions during onboarding. No insert/update/delete policies — professions are admin-seeded only.
