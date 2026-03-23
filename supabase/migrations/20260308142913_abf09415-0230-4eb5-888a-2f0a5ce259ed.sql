
CREATE TABLE public.user_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  automation_id text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, automation_id)
);

ALTER TABLE public.user_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automations" ON public.user_automations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own automations" ON public.user_automations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own automations" ON public.user_automations
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own automations" ON public.user_automations
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
