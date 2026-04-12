-- SystemLumina: Merge OnTheLine tables into CRMLuminus Supabase

-- Posts table (from OnTheLine)
CREATE TABLE IF NOT EXISTS posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_type text NOT NULL DEFAULT 'feed',
  nicho text,
  tema text,
  tom text,
  detalhes text,
  generated_content text,
  media_url text,
  scheduled_at timestamptz,
  published_at timestamptz,
  status text NOT NULL DEFAULT 'rascunho',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage own posts"
  ON posts FOR ALL USING (auth.uid() = user_id);

-- Instagram connections table
CREATE TABLE IF NOT EXISTS instagram_connections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  instagram_user_id text,
  instagram_username text,
  access_token text,
  token_expires_at timestamptz,
  page_id text,
  is_active boolean DEFAULT true,
  connected_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE instagram_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage own instagram connections"
  ON instagram_connections FOR ALL USING (auth.uid() = user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'info',
  post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage own notifications"
  ON notifications FOR ALL USING (auth.uid() = user_id);

-- Automations table
CREATE TABLE IF NOT EXISTS automations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  enabled boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, type)
);

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage own automations"
  ON automations FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "Authenticated users can upload media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Anyone can view media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-media');
