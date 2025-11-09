-- Create storage bucket for recordings and screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('recordings', 'recordings', false, 524288000, ARRAY['video/webm', 'video/mp4', 'image/png', 'image/jpeg']),
  ('screenshots', 'screenshots', false, 10485760, ARRAY['image/png', 'image/jpeg']);

-- Create RLS policies for recordings bucket
CREATE POLICY "Parents can view recordings of their children"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'recordings' AND
  auth.uid() IN (
    SELECT parent_id FROM device_pairings 
    WHERE child_id::text = (storage.foldername(name))[1]
    AND is_active = true
  )
);

CREATE POLICY "Children can view their own recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'recordings' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "System can upload recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'recordings' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Parents can delete recordings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'recordings' AND
  auth.uid() IN (
    SELECT parent_id FROM device_pairings 
    WHERE child_id::text = (storage.foldername(name))[1]
    AND is_active = true
  )
);

-- Create RLS policies for screenshots bucket
CREATE POLICY "Parents can view screenshots of their children"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'screenshots' AND
  auth.uid() IN (
    SELECT parent_id FROM device_pairings 
    WHERE child_id::text = (storage.foldername(name))[1]
    AND is_active = true
  )
);

CREATE POLICY "Children can view their own screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "System can upload screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Parents can delete screenshots"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'screenshots' AND
  auth.uid() IN (
    SELECT parent_id FROM device_pairings 
    WHERE child_id::text = (storage.foldername(name))[1]
    AND is_active = true
  )
);

-- Create table for media records
CREATE TABLE IF NOT EXISTS public.media_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('recording', 'screenshot')),
  file_path TEXT NOT NULL,
  file_size BIGINT,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.media_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view media records of their children"
ON public.media_records FOR SELECT
USING (
  auth.uid() IN (
    SELECT parent_id FROM device_pairings 
    WHERE child_id = user_id AND is_active = true
  )
);

CREATE POLICY "Children can view their own media records"
ON public.media_records FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert media records"
ON public.media_records FOR INSERT
WITH CHECK (auth.uid() = user_id);