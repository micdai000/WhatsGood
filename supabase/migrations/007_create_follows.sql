-- Follow relationships: users follow users, entities, and libraries.

CREATE TABLE public.user_follows (
  follower_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT user_follows_no_self CHECK (follower_id != following_id)
);

CREATE TABLE public.entity_follows (
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_id  UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, entity_id)
);

CREATE TABLE public.library_follows (
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  library_id UUID NOT NULL REFERENCES public.libraries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, library_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User follows are publicly readable"
  ON public.user_follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others"
  ON public.user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others"
  ON public.user_follows FOR DELETE
  USING (auth.uid() = follower_id);

CREATE POLICY "Entity follows are publicly readable"
  ON public.entity_follows FOR SELECT USING (true);

CREATE POLICY "Users can follow entities"
  ON public.entity_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow entities"
  ON public.entity_follows FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Library follows are publicly readable"
  ON public.library_follows FOR SELECT USING (true);

CREATE POLICY "Users can follow libraries"
  ON public.library_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow libraries"
  ON public.library_follows FOR DELETE
  USING (auth.uid() = user_id);

-- Keep denormalized follower counts in sync.
CREATE OR REPLACE FUNCTION public.handle_user_follow_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    RETURN NEW;
  END IF;
  UPDATE public.profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
  UPDATE public.profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_entity_follow_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.entities SET followers_count = followers_count + 1 WHERE id = NEW.entity_id;
    UPDATE public.profiles SET entities_followed_count = entities_followed_count + 1 WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;
  UPDATE public.entities SET followers_count = followers_count - 1 WHERE id = OLD.entity_id;
  UPDATE public.profiles SET entities_followed_count = entities_followed_count - 1 WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_library_follow_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.libraries SET follower_count = follower_count + 1 WHERE id = NEW.library_id;
    RETURN NEW;
  END IF;
  UPDATE public.libraries SET follower_count = follower_count - 1 WHERE id = OLD.library_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_follow_change
  AFTER INSERT OR DELETE ON public.user_follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_follow_change();

CREATE TRIGGER on_entity_follow_change
  AFTER INSERT OR DELETE ON public.entity_follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_entity_follow_change();

CREATE TRIGGER on_library_follow_change
  AFTER INSERT OR DELETE ON public.library_follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_library_follow_change();
