-- Create function to generate 15-character alphanumeric pairing code
CREATE OR REPLACE FUNCTION public.generate_pairing_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed ambiguous chars: 0, O, 1, I
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..15 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;