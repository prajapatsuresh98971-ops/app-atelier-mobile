import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  metadata: any;
  created_at: string;
}

interface NotificationPreferences {
  geofence_alerts: boolean;
  device_offline_alerts: boolean;
  suspicious_activity_alerts: boolean;
  activity_updates: boolean;
  browser_notifications: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const requestBrowserPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  const showBrowserNotification = (title: string, message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  };

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences
        const { data: newPrefs, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        setPreferences(newPrefs);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  }, [user]);

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    fetchPreferences();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
            variant: newNotification.priority === 'high' ? 'destructive' : 'default',
          });

          // Show browser notification if enabled
          if (preferences?.browser_notifications) {
            showBrowserNotification(newNotification.title, newNotification.message);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, preferences?.browser_notifications, toast, fetchNotifications, fetchPreferences]);

  return {
    notifications,
    preferences,
    unreadCount,
    isLoading,
    requestBrowserPermission,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };
};
