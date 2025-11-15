-- Create geofences table
CREATE TABLE IF NOT EXISTS public.geofences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL,
  child_id UUID NOT NULL,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius INTEGER NOT NULL DEFAULT 200,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notify_on_enter BOOLEAN NOT NULL DEFAULT true,
  notify_on_exit BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.geofences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can manage geofences"
ON public.geofences FOR ALL
USING (auth.uid() = parent_id);

CREATE POLICY "Children can view geofences"
ON public.geofences FOR SELECT
USING (auth.uid() = child_id);

-- Create report preferences table
CREATE TABLE IF NOT EXISTS public.report_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.report_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their report preferences"
ON public.report_preferences FOR ALL
USING (auth.uid() = user_id);

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;