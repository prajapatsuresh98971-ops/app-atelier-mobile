-- Create support_tickets table for admin dashboard
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
ON public.support_tickets
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own tickets
CREATE POLICY "Users can create tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update all tickets
CREATE POLICY "Admins can update tickets"
ON public.support_tickets
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create system_stats table for admin monitoring
CREATE TABLE IF NOT EXISTS public.system_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_stats ENABLE ROW LEVEL SECURITY;

-- Only admins can view system stats
CREATE POLICY "Admins can view system stats"
ON public.system_stats
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  geofence_alerts BOOLEAN NOT NULL DEFAULT true,
  device_offline_alerts BOOLEAN NOT NULL DEFAULT true,
  suspicious_activity_alerts BOOLEAN NOT NULL DEFAULT true,
  activity_updates BOOLEAN NOT NULL DEFAULT true,
  browser_notifications BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "Users can manage notification preferences"
ON public.notification_preferences
FOR ALL
USING (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;