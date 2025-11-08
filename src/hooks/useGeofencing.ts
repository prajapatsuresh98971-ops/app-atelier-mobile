import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GeofenceZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export const useGeofencing = (
  currentLocation: { latitude: number; longitude: number } | null,
  zones: GeofenceZone[]
) => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!currentLocation || zones.length === 0) return;

    const checkGeofences = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-geofence', {
          body: {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            zones,
          },
        });

        if (error) throw error;

        if (data.alerts && data.alerts.length > 0) {
          setAlerts(data.alerts);
          
          data.alerts.forEach((alert: any) => {
            toast({
              title: alert.status === 'entered' ? 'Entered Safe Zone' : 'Left Safe Zone',
              description: `${alert.zone.name} - ${Math.round(alert.distance)}m away`,
            });
          });
        }
      } catch (error) {
        console.error('Geofence check error:', error);
      }
    };

    checkGeofences();
  }, [currentLocation, zones, toast]);

  return { alerts };
};
