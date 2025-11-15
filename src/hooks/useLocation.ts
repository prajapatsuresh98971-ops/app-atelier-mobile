import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useLocation = (enableTracking: boolean = false) => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const { toast } = useToast();

  const updateLocation = async (latitude: number, longitude: number, accuracy?: number) => {
    try {
      const { error } = await supabase.functions.invoke('update-location', {
        body: { latitude, longitude, accuracy },
      });
      
      if (error) throw error;
      
      setLocation({ latitude, longitude, accuracy });
    } catch (error: any) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!enableTracking) return;

    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setIsTracking(true);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        updateLocation(latitude, longitude, accuracy);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: "Location Error",
          description: "Failed to get your location. Please enable location services.",
          variant: "destructive",
        });
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
    };
  }, [enableTracking]);

  return {
    location,
    isTracking,
    updateLocation,
  };
};
