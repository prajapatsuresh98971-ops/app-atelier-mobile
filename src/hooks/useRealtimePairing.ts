import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useRealtimePairing = (onPairingUpdate?: () => void) => {
  const { toast } = useToast();
  const { user, role } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('pairing-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'device_pairings',
          filter: role === 'parent' ? `parent_id=eq.${user.id}` : `child_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Pairing change:', payload);

          if (payload.eventType === 'INSERT') {
            if (role === 'child') {
              toast({
                title: "New Pairing Request",
                description: "A parent wants to pair with your device",
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const newRecord = payload.new as any;
            
            if (newRecord.status === 'active' && role === 'parent') {
              toast({
                title: "Pairing Accepted",
                description: "Your child has accepted the pairing request",
              });
            }
          }

          if (onPairingUpdate) {
            onPairingUpdate();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role, onPairingUpdate, toast]);
};
