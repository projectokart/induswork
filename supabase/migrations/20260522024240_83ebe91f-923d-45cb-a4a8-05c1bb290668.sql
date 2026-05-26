
-- Extend profiles with public-card fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS services text[] DEFAULT '{}'::text[];

-- Public can read provider profiles (only those with role=provider)
DROP POLICY IF EXISTS "public view provider profiles" ON public.profiles;
CREATE POLICY "public view provider profiles"
ON public.profiles FOR SELECT
USING (role = 'provider'::app_role);

-- Ratings
CREATE TABLE IF NOT EXISTS public.provider_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  rater_id uuid NOT NULL,
  stars int NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, rater_id)
);
ALTER TABLE public.provider_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone view ratings" ON public.provider_ratings
  FOR SELECT USING (true);
CREATE POLICY "auth users rate" ON public.provider_ratings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = rater_id AND auth.uid() <> provider_id);
CREATE POLICY "update own rating" ON public.provider_ratings
  FOR UPDATE TO authenticated USING (auth.uid() = rater_id) WITH CHECK (auth.uid() = rater_id);
CREATE POLICY "delete own rating" ON public.provider_ratings
  FOR DELETE TO authenticated USING (auth.uid() = rater_id);

-- Reports / complaints
CREATE TABLE IF NOT EXISTS public.provider_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  reporter_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.provider_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth users file report" ON public.provider_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reporter view own reports" ON public.provider_reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins manage reports" ON public.provider_reports
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins delete reports" ON public.provider_reports
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars public read" ON storage.objects;
CREATE POLICY "avatars public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars owner upload" ON storage.objects;
CREATE POLICY "avatars owner upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "avatars owner update" ON storage.objects;
CREATE POLICY "avatars owner update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "avatars owner delete" ON storage.objects;
CREATE POLICY "avatars owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
