-- ============================================================
-- SYSTEMLUMINA — Script de Setup Completo
-- Projeto: fqawispuqykokrujxohj (systemlumina)
-- Cole TUDO no SQL Editor e clique em RUN
-- ============================================================


-- ============================================================
-- 1. Função auxiliar de timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;


-- ============================================================
-- 2. Tabela PROFILES (criada automaticamente no signup)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  phone       TEXT,
  role        TEXT DEFAULT 'operator',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-criar profile no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 3. Tabela LEADS (CRM Pipeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id            UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  company       TEXT,
  email         TEXT,
  phone         TEXT,
  value         NUMERIC NOT NULL DEFAULT 0,
  stage         TEXT NOT NULL DEFAULT 'lead-novo',
  channel       TEXT NOT NULL DEFAULT 'whatsapp',
  tags          TEXT[] DEFAULT '{}',
  assigned_to   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own leads"   ON public.leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

CREATE POLICY "Users can view their own leads"
  ON public.leads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own leads"
  ON public.leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own leads"
  ON public.leads FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own leads"
  ON public.leads FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================
-- 4. Tabela POSTS (Social Media IA)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id                UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_type         TEXT NOT NULL DEFAULT 'feed',
  nicho             TEXT,
  tema              TEXT,
  tom               TEXT,
  detalhes          TEXT,
  generated_content TEXT,
  media_url         TEXT,
  scheduled_at      TIMESTAMPTZ,
  published_at      TIMESTAMPTZ,
  status            TEXT NOT NULL DEFAULT 'rascunho',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own posts" ON public.posts;
CREATE POLICY "Users can manage own posts"
  ON public.posts FOR ALL TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================
-- 5. Tabela INSTAGRAM_CONNECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.instagram_connections (
  id                 UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_user_id  TEXT,
  instagram_username TEXT,
  access_token       TEXT,
  token_expires_at   TIMESTAMPTZ,
  page_id            TEXT,
  is_active          BOOLEAN DEFAULT true,
  connected_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.instagram_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own instagram connections" ON public.instagram_connections;
CREATE POLICY "Users can manage own instagram connections"
  ON public.instagram_connections FOR ALL TO authenticated USING (auth.uid() = user_id);


-- ============================================================
-- 6. Tabela NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT,
  type       TEXT NOT NULL DEFAULT 'info',
  post_id    UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  read       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications"
  ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id);


-- ============================================================
-- 7. Tabela AUTOMATIONS (Social Media)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.automations (
  id         UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  enabled    BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, type)
);

ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own automations" ON public.automations;
CREATE POLICY "Users can manage own automations"
  ON public.automations FOR ALL TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_automations_updated_at ON public.automations;
CREATE TRIGGER update_automations_updated_at
  BEFORE UPDATE ON public.automations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================
-- 8. Storage bucket para mídias
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view media"               ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media"          ON storage.objects;

CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-media');

CREATE POLICY "Anyone can view media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-media');

CREATE POLICY "Users can delete own media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'post-media');


-- ============================================================
-- ✅ CONCLUÍDO! Verifique no Table Editor:
--    profiles | leads | posts | instagram_connections
--    notifications | automations
-- ============================================================
