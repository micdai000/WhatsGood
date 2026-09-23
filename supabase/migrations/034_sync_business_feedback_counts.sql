-- Keep businesses.total_feedback aligned with reputation_feedback.
-- Public pages, search cards, and the dashboard all read this column.

CREATE OR REPLACE FUNCTION public.refresh_business_total_feedback(p_business_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_business_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.businesses
  SET total_feedback = (
    SELECT COUNT(*)::INTEGER
    FROM public.reputation_feedback
    WHERE business_id = p_business_id
  )
  WHERE id = p_business_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_reputation_feedback_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.business_id IS DISTINCT FROM OLD.business_id THEN
      PERFORM public.refresh_business_total_feedback(OLD.business_id);
      PERFORM public.refresh_business_total_feedback(NEW.business_id);
    END IF;
    RETURN NEW;
  END IF;

  PERFORM public.refresh_business_total_feedback(
    COALESCE(NEW.business_id, OLD.business_id)
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_reputation_feedback_change ON public.reputation_feedback;
CREATE TRIGGER on_reputation_feedback_change
  AFTER INSERT OR UPDATE OF business_id OR DELETE ON public.reputation_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_reputation_feedback_change();

REVOKE ALL ON FUNCTION public.refresh_business_total_feedback(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_reputation_feedback_change() FROM PUBLIC;

UPDATE public.businesses AS business
SET total_feedback = counts.feedback_count
FROM (
  SELECT
    businesses.id,
    COUNT(reputation_feedback.id)::INTEGER AS feedback_count
  FROM public.businesses
  LEFT JOIN public.reputation_feedback
    ON reputation_feedback.business_id = businesses.id
  GROUP BY businesses.id
) AS counts
WHERE business.id = counts.id
  AND business.total_feedback IS DISTINCT FROM counts.feedback_count;
