
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS scheduled_date date,
  ADD COLUMN IF NOT EXISTS scheduled_time text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS provider_id uuid,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS bookings_provider_id_idx ON public.bookings(provider_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);

-- Providers can view open jobs (unassigned) and jobs assigned to them
CREATE POLICY "providers view jobs"
ON public.bookings FOR SELECT
USING (
  public.has_role(auth.uid(), 'provider'::public.app_role)
  AND (provider_id IS NULL OR provider_id = auth.uid())
);

-- Providers can update jobs assigned to them OR claim an unassigned job (assigning themselves)
CREATE POLICY "providers update jobs"
ON public.bookings FOR UPDATE
USING (
  public.has_role(auth.uid(), 'provider'::public.app_role)
  AND (provider_id IS NULL OR provider_id = auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'provider'::public.app_role)
  AND provider_id = auth.uid()
);

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

CREATE POLICY "admins update contact"
ON public.contact_messages FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins delete contact"
ON public.contact_messages FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
