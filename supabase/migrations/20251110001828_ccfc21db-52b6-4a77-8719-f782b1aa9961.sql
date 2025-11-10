-- Fix has_role function to have explicit search_path
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role)
SET search_path = public;

-- Fix storage policies to remove anonymous access
-- Drop existing policies that might allow anonymous access
DROP POLICY IF EXISTS "Children can view their own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Children can view their own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Parents can view recordings of their children" ON storage.objects;
DROP POLICY IF EXISTS "Parents can view screenshots of their children" ON storage.objects;
DROP POLICY IF EXISTS "Parents can delete recordings" ON storage.objects;
DROP POLICY IF EXISTS "Parents can delete screenshots" ON storage.objects;

-- Recreate storage policies with proper authentication checks
CREATE POLICY "Authenticated children can view their own recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Authenticated children can view their own screenshots"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Authenticated parents can view paired children recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'recordings'
  AND EXISTS (
    SELECT 1 FROM public.device_pairings
    WHERE parent_id = auth.uid()
    AND child_id::text = (storage.foldername(name))[1]
    AND is_active = true
    AND status = 'active'
  )
);

CREATE POLICY "Authenticated parents can view paired children screenshots"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'screenshots'
  AND EXISTS (
    SELECT 1 FROM public.device_pairings
    WHERE parent_id = auth.uid()
    AND child_id::text = (storage.foldername(name))[1]
    AND is_active = true
    AND status = 'active'
  )
);

CREATE POLICY "Authenticated parents can delete paired children recordings"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings'
  AND EXISTS (
    SELECT 1 FROM public.device_pairings
    WHERE parent_id = auth.uid()
    AND child_id::text = (storage.foldername(name))[1]
    AND is_active = true
    AND status = 'active'
  )
);

CREATE POLICY "Authenticated parents can delete paired children screenshots"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'screenshots'
  AND EXISTS (
    SELECT 1 FROM public.device_pairings
    WHERE parent_id = auth.uid()
    AND child_id::text = (storage.foldername(name))[1]
    AND is_active = true
    AND status = 'active'
  )
);