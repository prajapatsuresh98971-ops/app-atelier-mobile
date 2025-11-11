-- Add is_used column to device_pairings table
ALTER TABLE public.device_pairings 
ADD COLUMN IF NOT EXISTS is_used boolean NOT NULL DEFAULT false;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_device_pairings_pairing_code ON public.device_pairings(pairing_code) WHERE is_used = false;
CREATE INDEX IF NOT EXISTS idx_device_pairings_child_active ON public.device_pairings(child_id, is_used) WHERE is_used = false;

-- Add constraint to prevent expired codes from being used
CREATE OR REPLACE FUNCTION check_pairing_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at < NOW() AND NEW.is_used = false THEN
    RAISE EXCEPTION 'Cannot use expired pairing code';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_pairing_not_expired
  BEFORE UPDATE ON public.device_pairings
  FOR EACH ROW
  WHEN (OLD.is_used = false AND NEW.is_used = true)
  EXECUTE FUNCTION check_pairing_expiry();

-- Function to revoke other active codes for a child
CREATE OR REPLACE FUNCTION revoke_child_pairing_codes(_child_id uuid, _except_pairing_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE device_pairings
  SET is_used = true, 
      status = 'active'::pairing_status,
      updated_at = NOW()
  WHERE child_id = _child_id 
    AND is_used = false
    AND (_except_pairing_id IS NULL OR id != _except_pairing_id);
END;
$$;

-- Add updated_at column if not exists
ALTER TABLE public.device_pairings 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();