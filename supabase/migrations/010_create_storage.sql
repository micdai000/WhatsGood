-- Supabase Storage buckets for user and content images.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'avatars',
    'avatars',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'entity-images',
    'entity-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'library-covers',
    'library-covers',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
ON CONFLICT (id) DO NOTHING;

-- avatars: profile-images/{user_id}/filename
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
CREATE POLICY "Avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- entity-images: entity-images/{entity_id}/filename
DROP POLICY IF EXISTS "Entity images are publicly readable" ON storage.objects;
CREATE POLICY "Entity images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'entity-images');

DROP POLICY IF EXISTS "Authenticated users can upload entity images" ON storage.objects;
CREATE POLICY "Authenticated users can upload entity images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'entity-images'
    AND auth.role() = 'authenticated'
  );

-- library-covers: library-covers/{library_id}/filename
DROP POLICY IF EXISTS "Library covers are publicly readable" ON storage.objects;
CREATE POLICY "Library covers are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'library-covers');

DROP POLICY IF EXISTS "Authenticated users can upload library covers" ON storage.objects;
CREATE POLICY "Authenticated users can upload library covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'library-covers'
    AND auth.role() = 'authenticated'
  );
