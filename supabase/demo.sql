-- =============================================================================
-- Meritt Pros — demo account seed (re-runnable)
-- =============================================================================
--
-- LOGIN
--   Email:    testing@test.com
--   Password: Jeppson--501
--
-- AFTER RUNNING
--   /login              → sign in
--   /dashboard          → stats, trends, review requests, activity
--   /u/testdemo         → public profile with Gold badge
--   /review/alexrivera  → leave a trust vote on a peer professional
--   /search             → browse testdemo + peer profiles
--   /admin              → owner admin panel
--
-- REVIEW REQUEST LINKS (pending invitation)
--   /review/request/b0000001-0000-4000-8000-000000000001
--
-- Requires: migrations through 019 applied, and seed.sql entities (optional).
-- Run in the Supabase SQL editor or: psql ... -f supabase/demo.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $demo$
DECLARE
  -- Fixed demo user IDs (stable across re-runs)
  v_main_id    UUID := 'a0000001-0000-4000-8000-000000000001';
  v_peer1_id   UUID := 'a0000002-0000-4000-8000-000000000002';
  v_peer2_id   UUID := 'a0000003-0000-4000-8000-000000000003';

  v_photography_id UUID;
  v_detailing_id   UUID;
  v_tutoring_id    UUID;

  v_period TEXT := to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM');

  v_pending_token   UUID := 'b0000001-0000-4000-8000-000000000001';
  v_completed_token UUID := 'b0000002-0000-4000-8000-000000000002';
  v_expired_token   UUID := 'b0000003-0000-4000-8000-000000000003';

  v_completed_review_id UUID;

  v_entity_chick_fil_a UUID;
  v_entity_disneyland  UUID;
BEGIN
  -- -------------------------------------------------------------------------
  -- Reset previous demo rows
  -- -------------------------------------------------------------------------
  DELETE FROM auth.users
  WHERE id IN (v_main_id, v_peer1_id, v_peer2_id);

  SELECT id INTO v_photography_id FROM public.professions WHERE slug = 'photography' LIMIT 1;
  SELECT id INTO v_detailing_id   FROM public.professions WHERE slug = 'car-detailing' LIMIT 1;
  SELECT id INTO v_tutoring_id   FROM public.professions WHERE slug = 'tutoring-coaching' LIMIT 1;

  IF v_photography_id IS NULL THEN
    RAISE EXCEPTION 'Run profession migrations (011/018) before demo.sql';
  END IF;

  -- -------------------------------------------------------------------------
  -- Auth: main demo account
  -- -------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_main_id,
    'authenticated',
    'authenticated',
    'testing@test.com',
    crypt('Jeppson--501', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('email', 'testing@test.com', 'email_verified', true),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_main_id,
    v_main_id::text,
    jsonb_build_object(
      'sub', v_main_id::text,
      'email', 'testing@test.com',
      'email_verified', true
    ),
    'email',
    now(),
    now(),
    now()
  );

  -- Peer professionals (browse / search / trust-vote targets; no login required)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
  ) VALUES
    (
      '00000000-0000-0000-0000-000000000000', v_peer1_id, 'authenticated', 'authenticated',
      'alexrivera.demo@local.test', crypt('unused-peer-password', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      now(), now(), '', '', '', ''
    ),
    (
      '00000000-0000-0000-0000-000000000000', v_peer2_id, 'authenticated', 'authenticated',
      'jordanlee.demo@local.test', crypt('unused-peer-password', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      now(), now(), '', '', '', ''
    );

  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  SELECT
    gen_random_uuid(),
    u.id,
    u.id::text,
    jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
    'email',
    now(),
    now(),
    now()
  FROM auth.users u
  WHERE u.id IN (v_peer1_id, v_peer2_id);

  -- -------------------------------------------------------------------------
  -- Profiles
  -- -------------------------------------------------------------------------
  INSERT INTO public.profiles (
    id, username, display_name, avatar, bio,
    profession_id, city, state,
    current_badge_tier, current_badge_sub_tier, current_badge_period
  ) VALUES (
    v_main_id,
    'testdemo',
    'Test Demo',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'Demo account for exploring Meritt Pros — photography, trust votes, dashboard analytics, and admin tools.',
    v_photography_id,
    'Nashville',
    'TN',
    'gold',
    2,
    v_period
  );

  INSERT INTO public.profiles (
    id, username, display_name, avatar, bio,
    profession_id, city, state,
    current_badge_tier, current_badge_sub_tier, current_badge_period
  ) VALUES
    (
      v_peer1_id,
      'alexrivera',
      'Alex Rivera',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      'Mobile car detailing with showroom finishes. Serving greater Austin.',
      v_detailing_id,
      'Austin',
      'TX',
      'silver',
      1,
      v_period
    ),
    (
      v_peer2_id,
      'jordanlee',
      'Jordan Lee',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      'SAT prep and academic coaching for high-school students.',
      v_tutoring_id,
      'Denver',
      'CO',
      'bronze',
      3,
      v_period
    );

  -- Owner admin access for the demo account
  INSERT INTO public.admin_users (user_id, role)
  VALUES (v_main_id, 'owner')
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

  -- -------------------------------------------------------------------------
  -- Trust votes (reviews) on the main demo profile
  -- Spread across recent weeks so dashboard trend charts populate.
  -- -------------------------------------------------------------------------
  INSERT INTO public.reviews (
    profile_id, reviewer_name, reviewer_email, rating, title, body,
    would_recommend, relationship, verified, created_at
  ) VALUES
    (
      v_main_id, 'Sarah Mitchell', 'sarah.mitchell@example.com', 5,
      'Promote trust vote', 'Promote trust vote for Test Demo.',
      true, 'Past client', true, now() - interval '3 days'
    ),
    (
      v_main_id, 'James Ortiz', 'james.ortiz@example.com', 5,
      'Promote trust vote', 'Promote trust vote for Test Demo.',
      true, 'Wedding client', false, now() - interval '10 days'
    ),
    (
      v_main_id, 'Emily Chen', 'emily.chen@example.com', 3,
      'Maintain trust vote', 'Maintain trust vote for Test Demo.',
      true, 'Portrait session', false, now() - interval '18 days'
    ),
    (
      v_main_id, 'Marcus Webb', 'marcus.webb@example.com', 5,
      'Promote trust vote', 'Promote trust vote for Test Demo.',
      true, 'Brand shoot', false, now() - interval '25 days'
    ),
    (
      v_main_id, 'Priya Nair', 'priya.nair@example.com', 5,
      'Promote trust vote', 'Promote trust vote for Test Demo.',
      true, 'Family photos', false, now() - interval '35 days'
    ),
    (
      v_main_id, 'Chris Dalton', 'chris.dalton@example.com', 1,
      'Demote trust vote', 'Demote trust vote for Test Demo.',
      false, 'One-off project', false, now() - interval '48 days'
    );

  -- A couple of reviews on peer profiles (shows search diversity)
  INSERT INTO public.reviews (
    profile_id, reviewer_name, reviewer_email, rating, title, body,
    would_recommend, verified, created_at
  ) VALUES
    (
      v_peer1_id, 'Local Customer', 'customer1@example.com', 5,
      'Promote trust vote', 'Promote trust vote for Alex Rivera.',
      true, false, now() - interval '6 days'
    ),
    (
      v_peer1_id, 'Repeat Client', 'customer2@example.com', 3,
      'Maintain trust vote', 'Maintain trust vote for Alex Rivera.',
      true, false, now() - interval '20 days'
    ),
    (
      v_peer2_id, 'Parent', 'parent@example.com', 5,
      'Promote trust vote', 'Promote trust vote for Jordan Lee.',
      true, false, now() - interval '8 days'
    );

  -- -------------------------------------------------------------------------
  -- Review requests (pending, completed, expired)
  -- -------------------------------------------------------------------------
  INSERT INTO public.review_requests (
    id, profile_id, email, token, status, created_at, expires_at, completed_at
  ) VALUES
    (
      gen_random_uuid(),
      v_main_id,
      'client.pending@example.com',
      v_pending_token,
      'pending',
      now() - interval '2 days',
      now() + interval '28 days',
      NULL
    ),
    (
      gen_random_uuid(),
      v_main_id,
      'sarah.mitchell@example.com',
      v_completed_token,
      'completed',
      now() - interval '14 days',
      now() + interval '16 days',
      now() - interval '3 days'
    ),
    (
      gen_random_uuid(),
      v_main_id,
      'client.expired@example.com',
      v_expired_token,
      'expired',
      now() - interval '45 days',
      now() - interval '15 days',
      NULL
    );

  -- Link the verified review to the completed request
  UPDATE public.reviews r
  SET
    verified = true,
    review_request_id = rr.id
  FROM public.review_requests rr
  WHERE rr.token = v_completed_token
    AND r.profile_id = v_main_id
    AND r.reviewer_email = 'sarah.mitchell@example.com'
  RETURNING r.id INTO v_completed_review_id;

  -- -------------------------------------------------------------------------
  -- Badge snapshots (current month)
  -- -------------------------------------------------------------------------
  INSERT INTO public.badge_snapshots (
    profile_id, period, trust_score, percentile, badge_tier, badge_sub_tier,
    review_count_window, eligible, component_breakdown, computed_at
  ) VALUES
    (
      v_main_id, v_period, 82.500, 88.00, 'gold', 2,
      5, true,
      '{"recency": 0.91, "rating": 0.86, "verified": 0.75, "volume": 0.78}'::jsonb,
      now()
    ),
    (
      v_peer1_id, v_period, 71.200, 62.00, 'silver', 1,
      2, false,
      '{"recency": 0.80, "rating": 0.82, "verified": 0.50, "volume": 0.45}'::jsonb,
      now()
    ),
    (
      v_peer2_id, v_period, 64.800, 55.00, 'bronze', 3,
      1, false,
      '{"recency": 0.75, "rating": 0.85, "verified": 0.50, "volume": 0.30}'::jsonb,
      now()
    )
  ON CONFLICT (profile_id, period) DO UPDATE
  SET
    trust_score = EXCLUDED.trust_score,
    percentile = EXCLUDED.percentile,
    badge_tier = EXCLUDED.badge_tier,
    badge_sub_tier = EXCLUDED.badge_sub_tier,
    review_count_window = EXCLUDED.review_count_window,
    eligible = EXCLUDED.eligible,
    component_breakdown = EXCLUDED.component_breakdown,
    computed_at = EXCLUDED.computed_at;

  -- -------------------------------------------------------------------------
  -- Social graph (followers / entity follows)
  -- -------------------------------------------------------------------------
  INSERT INTO public.user_follows (follower_id, following_id, created_at)
  VALUES
    (v_peer1_id, v_main_id, now() - interval '12 days'),
    (v_peer2_id, v_main_id, now() - interval '8 days')
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_entity_chick_fil_a FROM public.entities WHERE slug = 'chick-fil-a' LIMIT 1;
  SELECT id INTO v_entity_disneyland  FROM public.entities WHERE slug = 'disneyland' LIMIT 1;

  IF v_entity_chick_fil_a IS NOT NULL THEN
    INSERT INTO public.entity_follows (user_id, entity_id, created_at)
    VALUES (v_main_id, v_entity_chick_fil_a, now() - interval '5 days')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.votes (user_id, entity_id, vote_type, created_at)
    VALUES (v_main_id, v_entity_chick_fil_a, 'promote', now() - interval '5 days')
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_entity_disneyland IS NOT NULL THEN
    INSERT INTO public.entity_follows (user_id, entity_id, created_at)
    VALUES (v_main_id, v_entity_disneyland, now() - interval '3 days')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.votes (user_id, entity_id, vote_type, created_at)
    VALUES (v_main_id, v_entity_disneyland, 'maintain', now() - interval '3 days')
    ON CONFLICT DO NOTHING;
  END IF;

  -- -------------------------------------------------------------------------
  -- Demo library
  -- -------------------------------------------------------------------------
  INSERT INTO public.libraries (
    id, name, description, cover_image, creator_id, is_public, follower_count
  ) VALUES (
    'c0000001-0000-4000-8000-000000000001',
    'Nashville favorites',
    'Places and spots I recommend to clients visiting Nashville.',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    v_main_id,
    true,
    4
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    cover_image = EXCLUDED.cover_image;

  IF v_entity_disneyland IS NOT NULL THEN
    INSERT INTO public.library_items (library_id, entity_id, position)
    VALUES ('c0000001-0000-4000-8000-000000000001', v_entity_disneyland, 0)
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_entity_chick_fil_a IS NOT NULL THEN
    INSERT INTO public.library_items (library_id, entity_id, position)
    VALUES ('c0000001-0000-4000-8000-000000000001', v_entity_chick_fil_a, 1)
    ON CONFLICT DO NOTHING;
  END IF;

  RAISE NOTICE 'Demo account ready: testing@test.com / Jeppson--501';
  RAISE NOTICE 'Public profile: /u/testdemo';
  RAISE NOTICE 'Pending review link: /review/request/%', v_pending_token;
END;
$demo$;
