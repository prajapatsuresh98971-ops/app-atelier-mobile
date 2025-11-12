import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useMediaStatus() {
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to activity logs for media control events
    const channel = supabase
      .channel('media-status')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const log = payload.new;
          if (log.activity_type === 'media_control' && log.metadata) {
            const { device_type, action } = log.metadata as any;
            const isEnabled = action === 'enable';
            
            if (device_type === 'camera') {
              setCameraActive(isEnabled);
            } else if (device_type === 'microphone') {
              setMicActive(isEnabled);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { cameraActive, micActive };
}
