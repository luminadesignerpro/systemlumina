
-- Add media_url column to posts table
ALTER TABLE public.posts ADD COLUMN media_url text;

-- Create storage bucket for post media
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true);

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'post-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to read their own media
CREATE POLICY "Users can read their own media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'post-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access for published media
CREATE POLICY "Public can read post media"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'post-media');

-- Allow users to delete their own media
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'post-media' AND (storage.foldername(name))[1] = auth.uid()::text);
