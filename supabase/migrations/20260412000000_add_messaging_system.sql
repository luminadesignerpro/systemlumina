-- SystemLumina: Messaging System (WhatsApp + Multi-channel)

-- WhatsApp Connections table
CREATE TABLE IF NOT EXISTS whatsapp_connections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone_number_id text NOT NULL,
  business_account_id text,
  phone_number text,
  display_name text,
  access_token text,
  webhook_verify_token text,
  is_active boolean DEFAULT true,
  connected_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own whatsapp connections"
  ON whatsapp_connections FOR ALL USING (auth.uid() = user_id);

-- Conversations table (unified for all channels)
CREATE TABLE IF NOT EXISTS conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_name text NOT NULL,
  contact_identifier text NOT NULL, -- phone, instagram_id, etc
  channel text NOT NULL, -- whatsapp, instagram, messenger
  avatar_url text,
  status text NOT NULL DEFAULT 'open', -- open, pending, resolved, closed
  assigned_to uuid REFERENCES auth.users(id),
  last_message_at timestamptz DEFAULT now(),
  tags text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, contact_identifier, channel)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations"
  ON conversations FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_conversations_channel ON conversations(channel);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  direction text NOT NULL, -- incoming, outgoing
  message_type text DEFAULT 'text', -- text, image, video, audio, document
  media_url text,
  external_id text, -- ID from external platform (WhatsApp, Instagram, etc)
  status text DEFAULT 'sent', -- sent, delivered, read, failed
  metadata jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage messages in own conversations"
  ON messages FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_direction ON messages(direction);

-- Social Media Posts (extend existing posts table)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS platform text DEFAULT 'instagram';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS platform_post_id text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS metrics jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at);

-- Quick replies/templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  content text NOT NULL,
  category text,
  variables text[], -- placeholders like {name}, {company}
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own templates"
  ON message_templates FOR ALL USING (auth.uid() = user_id);

-- Chatbot flows table
CREATE TABLE IF NOT EXISTS chatbot_flows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  trigger_keywords text[],
  flow_data jsonb NOT NULL,
  enabled boolean DEFAULT true,
  channels text[], -- which channels this flow applies to
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE chatbot_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own chatbot flows"
  ON chatbot_flows FOR ALL USING (auth.uid() = user_id);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_connections_updated_at BEFORE UPDATE ON whatsapp_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_flows_updated_at BEFORE UPDATE ON chatbot_flows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
