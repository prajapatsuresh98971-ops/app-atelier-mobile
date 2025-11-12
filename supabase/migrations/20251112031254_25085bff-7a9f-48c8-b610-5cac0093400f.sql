-- Drop the existing policy and create a simpler one
DROP POLICY IF EXISTS "Children can create their own pairings" ON public.device_pairings;

-- Create a simpler INSERT policy for children
CREATE POLICY "Children can create their own pairings"
ON public.device_pairings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = child_id 
  AND has_role(auth.uid(), 'child'::app_role)
);