-- Join table linking entities to libraries.

CREATE TABLE public.library_items (
  library_id UUID NOT NULL REFERENCES public.libraries(id) ON DELETE CASCADE,
  entity_id  UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  position   INTEGER NOT NULL DEFAULT 0,
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (library_id, entity_id)
);

ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Library items are publicly readable"
  ON public.library_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.libraries l
      WHERE l.id = library_items.library_id
        AND (l.is_public = true OR l.creator_id = auth.uid())
    )
  );

CREATE POLICY "Library creators can add items"
  ON public.library_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.libraries l
      WHERE l.id = library_items.library_id
        AND l.creator_id = auth.uid()
    )
  );

CREATE POLICY "Library creators can remove items"
  ON public.library_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.libraries l
      WHERE l.id = library_items.library_id
        AND l.creator_id = auth.uid()
    )
  );
