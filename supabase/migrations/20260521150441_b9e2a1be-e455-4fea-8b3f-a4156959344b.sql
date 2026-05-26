
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  work_type TEXT NOT NULL,
  description TEXT NOT NULL,
  budget NUMERIC,
  status TEXT NOT NULL DEFAULT 'open',
  accepted_by UUID,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requirements are viewable by authenticated users"
  ON public.requirements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can post their own requirements"
  ON public.requirements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update their own requirements"
  ON public.requirements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can accept open requirements"
  ON public.requirements FOR UPDATE
  TO authenticated
  USING (status = 'open' AND accepted_by IS NULL AND public.has_role(auth.uid(), 'provider'))
  WITH CHECK (accepted_by = auth.uid() AND status = 'accepted');

CREATE POLICY "Owners can delete their own requirements"
  ON public.requirements FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all requirements"
  ON public.requirements FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_requirements_updated_at
  BEFORE UPDATE ON public.requirements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_requirements_status_created ON public.requirements (status, created_at DESC);
CREATE INDEX idx_requirements_user ON public.requirements (user_id);
