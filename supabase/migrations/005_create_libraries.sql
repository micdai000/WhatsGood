-- Curated collections of entities created by users.

CREATE TABLE public.libraries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  description    TEXT,
  cover_image    TEXT,
  creator_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_public      BOOLEAN NOT NULL DEFAULT true,
  follower_count INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.libraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public libraries are readable"
  ON public.libraries FOR SELECT
  USING (is_public = true OR auth.uid() = creator_id);

CREATE POLICY "Users can create libraries"
  ON public.libraries FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their libraries"
  ON public.libraries FOR UPDATE
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their libraries"
  ON public.libraries FOR DELETE
  USING (auth.uid() = creator_id);

CREATE TRIGGER on_library_updated
  BEFORE UPDATE ON public.libraries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Bump libraries_created_count when a user creates a library.
CREATE OR REPLACE FUNCTION public.handle_library_created()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET libraries_created_count = libraries_created_count + 1
  WHERE id = NEW.creator_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_library_created
  AFTER INSERT ON public.libraries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_library_created();
