-- Add INSERT policy for children to create their own pairing codes
CREATE POLICY "Children can create their own pairings"
ON public.device_pairings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = child_id 
  AND has_role(auth.uid(), 'child'::app_role)
  AND parent_id IS NULL  -- Parent ID must be NULL when child creates the pairing
  AND status = 'pending'::pairing_status
);