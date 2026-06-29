-- ============================================================
-- Supabase Storage buckets
-- ============================================================

-- Profile images bucket (avatars, headshots)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage RLS: anyone can view profile images (they're public)
CREATE POLICY "Profile images are publicly readable"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile-images');

-- Only authenticated users can upload to their own folder
-- Folder structure: profile-images/{user_id}/filename
CREATE POLICY "Users can upload their own profile image"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update (overwrite) their own images
CREATE POLICY "Users can update their own profile image"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own images
CREATE POLICY "Users can delete their own profile image"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
