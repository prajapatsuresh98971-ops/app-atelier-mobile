-- Enable realtime for device_pairings table
ALTER TABLE public.device_pairings REPLICA IDENTITY FULL;

-- Enable realtime for activity_logs table
ALTER TABLE public.activity_logs REPLICA IDENTITY FULL;

-- Enable realtime for location_history table
ALTER TABLE public.location_history REPLICA IDENTITY FULL;