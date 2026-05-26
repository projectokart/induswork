
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS price numeric(10,2);

CREATE TABLE IF NOT EXISTS public.search_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  city text,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can log search"
  ON public.search_queries FOR INSERT
  WITH CHECK (char_length(query) BETWEEN 1 AND 200);

CREATE POLICY "admins read search"
  ON public.search_queries FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
