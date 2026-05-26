CREATE TABLE public.call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  from_user UUID NOT NULL,
  to_user UUID,
  direction TEXT NOT NULL DEFAULT 'client_to_provider',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_seconds INTEGER,
  notes TEXT
);

CREATE INDEX idx_call_logs_booking ON public.call_logs(booking_id);

ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view related call logs"
ON public.call_logs FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = call_logs.booking_id
    AND (b.user_id = auth.uid() OR b.provider_id = auth.uid())
  )
);

CREATE POLICY "caller inserts call logs"
ON public.call_logs FOR INSERT
WITH CHECK (
  auth.uid() = from_user
  AND EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = call_logs.booking_id
    AND (b.user_id = auth.uid() OR b.provider_id = auth.uid())
  )
);

CREATE POLICY "admins manage call logs"
ON public.call_logs FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins delete call logs"
ON public.call_logs FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));