-- TrustLoop admin authorization and audit logging (Phase 13).
-- admin_users is the sole source of truth for administrator permissions.

-- ---------------------------------------------------------------------------
-- admin_users (table must exist before is_admin() / is_owner() functions)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('owner', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users (role);

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER — used by RLS policies)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
      AND role = 'owner'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_owner() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_owner() TO authenticated;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read admin_users" ON public.admin_users;
CREATE POLICY "Admins can read admin_users"
  ON public.admin_users FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Owners can add admins" ON public.admin_users;
CREATE POLICY "Owners can add admins"
  ON public.admin_users FOR INSERT
  WITH CHECK (
    public.is_owner()
    AND (
      role = 'admin'
      OR (
        role = 'owner'
        AND NOT EXISTS (SELECT 1 FROM public.admin_users WHERE role = 'owner')
      )
    )
  );

DROP POLICY IF EXISTS "Owners can remove non-owner admins" ON public.admin_users;
CREATE POLICY "Owners can remove non-owner admins"
  ON public.admin_users FOR DELETE
  USING (
    public.is_owner()
    AND role = 'admin'
    AND user_id <> auth.uid()
  );

-- ---------------------------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs (admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read audit_logs" ON public.audit_logs;
CREATE POLICY "Admins can read audit_logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can write audit_logs" ON public.audit_logs;
CREATE POLICY "Admins can write audit_logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.is_admin() AND admin_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Professions: disable support for admin moderation
-- ---------------------------------------------------------------------------

ALTER TABLE public.professions
  ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_professions_is_disabled ON public.professions (is_disabled);

DROP POLICY IF EXISTS "Admins can insert professions" ON public.professions;
CREATE POLICY "Admins can insert professions"
  ON public.professions FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update professions" ON public.professions;
CREATE POLICY "Admins can update professions"
  ON public.professions FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Admin moderation policies on reviews and profiles
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can delete any review" ON public.reviews;
CREATE POLICY "Admins can delete any review"
  ON public.reviews FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
CREATE POLICY "Admins can delete any profile"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- Admin RPC: list auth users (email is not in public schema)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_query TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  admin_role TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::TEXT,
    u.created_at,
    a.role AS admin_role
  FROM auth.users u
  LEFT JOIN public.admin_users a ON a.user_id = u.id
  WHERE
    p_query IS NULL
    OR p_query = ''
    OR u.email ILIKE '%' || p_query || '%'
    OR u.id::TEXT = p_query
  ORDER BY u.created_at DESC
  LIMIT GREATEST(1, LEAST(p_limit, 100))
  OFFSET GREATEST(0, p_offset);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_count_users(p_query TEXT DEFAULT NULL)
RETURNS BIGINT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total BIGINT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT COUNT(*)::BIGINT INTO total
  FROM auth.users u
  WHERE
    p_query IS NULL
    OR p_query = ''
    OR u.email ILIKE '%' || p_query || '%'
    OR u.id::TEXT = p_query;

  RETURN total;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users(TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_count_users(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users(TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_count_users(TEXT) TO authenticated;
