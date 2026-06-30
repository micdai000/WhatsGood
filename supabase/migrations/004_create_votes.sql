-- User votes on entities (and optionally specific food locations).
-- promote = +1 score, demote = -1 score, maintain = 0 score change.

CREATE TYPE public.vote_type AS ENUM ('promote', 'maintain', 'demote');

CREATE TABLE public.votes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_id        UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  food_location_id UUID REFERENCES public.food_locations(id) ON DELETE CASCADE,
  vote_type        public.vote_type NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One vote per user per entity (or per food location when location is set).
CREATE UNIQUE INDEX idx_votes_user_entity_location
  ON public.votes (user_id, entity_id, food_location_id) NULLS NOT DISTINCT;

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are publicly readable"
  ON public.votes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own votes"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON public.votes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON public.votes FOR DELETE
  USING (auth.uid() = user_id);

-- Score delta helper
CREATE OR REPLACE FUNCTION public.vote_score_delta(v public.vote_type)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE v
    WHEN 'promote' THEN 1
    WHEN 'demote'  THEN -1
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Keep entity/food_location scores and vote counts in sync.
CREATE OR REPLACE FUNCTION public.handle_vote_change()
RETURNS TRIGGER AS $$
DECLARE
  old_delta INTEGER;
  new_delta INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    new_delta := public.vote_score_delta(NEW.vote_type);

    IF NEW.food_location_id IS NOT NULL THEN
      UPDATE public.food_locations
      SET score = score + new_delta, total_votes = total_votes + 1
      WHERE id = NEW.food_location_id;
    ELSE
      UPDATE public.entities
      SET score = score + new_delta, total_votes = total_votes + 1
      WHERE id = NEW.entity_id;
    END IF;

    UPDATE public.profiles
    SET total_votes_cast = total_votes_cast + 1
    WHERE id = NEW.user_id;

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    old_delta := public.vote_score_delta(OLD.vote_type);
    new_delta := public.vote_score_delta(NEW.vote_type);

    IF OLD.food_location_id IS NOT NULL THEN
      UPDATE public.food_locations
      SET score = score - old_delta + new_delta
      WHERE id = OLD.food_location_id;
    ELSE
      UPDATE public.entities
      SET score = score - old_delta + new_delta
      WHERE id = OLD.entity_id;
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    old_delta := public.vote_score_delta(OLD.vote_type);

    IF OLD.food_location_id IS NOT NULL THEN
      UPDATE public.food_locations
      SET score = score - old_delta, total_votes = total_votes - 1
      WHERE id = OLD.food_location_id;
    ELSE
      UPDATE public.entities
      SET score = score - old_delta, total_votes = total_votes - 1
      WHERE id = OLD.entity_id;
    END IF;

    UPDATE public.profiles
    SET total_votes_cast = total_votes_cast - 1
    WHERE id = OLD.user_id;

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_vote_change();

CREATE TRIGGER on_vote_updated
  BEFORE UPDATE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
