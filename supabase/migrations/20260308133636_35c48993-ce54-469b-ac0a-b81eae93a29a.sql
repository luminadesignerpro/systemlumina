
-- Add published_at to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Create instagram_connections table for future Meta API integration
CREATE TABLE IF NOT EXISTS public.instagram_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  instagram_username text,
  instagram_user_id text,
  access_token text,
  token_expires_at timestamptz,
  page_id text,
  connected_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.instagram_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections" ON public.instagram_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own connections" ON public.instagram_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own connections" ON public.instagram_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own connections" ON public.instagram_connections FOR DELETE USING (auth.uid() = user_id);

-- Create notifications table for scheduled post reminders
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'publish_reminder',
  title text NOT NULL,
  message text,
  read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
