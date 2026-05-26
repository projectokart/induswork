CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'info',
  booking_id uuid,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "update own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "admins manage notifications" ON public.notifications
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow authenticated users to insert notifications for participants of a booking they're part of
CREATE POLICY "participants insert notifications" ON public.notifications
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (booking_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.id = notifications.booking_id
      AND (b.user_id = auth.uid() OR b.provider_id = auth.uid())
      AND (notifications.user_id = b.user_id OR notifications.user_id = b.provider_id)
  ))
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;