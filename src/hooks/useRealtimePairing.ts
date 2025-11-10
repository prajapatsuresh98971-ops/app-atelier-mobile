import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface UseRealtimePairingOptions {
  onPairingUpdate?: () => void;
  autoNavigateChild?: boolean;
}

export const useRealtimePairing = (options?: UseRealtimePairingOptions | (() => void)) => {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  
  // Handle both old callback signature and new options object
  const onPairingUpdate = typeof options === 'function' ? options : options?.onPairingUpdate;
  const autoNavigateChild = typeof options === 'object' ? options?.autoNavigateChild : false;

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
            const oldRecord = payload.old as any;
            
            // Child auto-navigation: when parent validates code, child_id is set
            if (role === 'child' && autoNavigateChild && 
                newRecord.parent_id && newRecord.parent_id !== oldRecord?.parent_id && 
                newRecord.status === 'pending') {
              toast({
                title: "Pairing Request Received",
                description: "Redirecting to permissions...",
              });
              setTimeout(() => navigate('/pairing/permissions'), 1500);
            }
            
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
  }, [user, role, onPairingUpdate, autoNavigateChild, navigate, toast]);
};
