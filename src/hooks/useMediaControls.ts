import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMediaControls = (childId: string) => {
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleCamera = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('camera-control', {
        body: {
          child_id: childId,
          device_type: 'camera',
          action: enabled ? 'enable' : 'disable',
        },
      });

      if (error) throw error;

      setCameraEnabled(enabled);
      toast({
        title: enabled ? "Camera enabled" : "Camera disabled",
        description: `Camera access has been ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error toggling camera:', error);
      toast({
        title: "Error",
        description: "Failed to toggle camera",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMicrophone = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('camera-control', {
        body: {
          child_id: childId,
          device_type: 'microphone',
          action: enabled ? 'enable' : 'disable',
        },
      });

      if (error) throw error;

      setMicEnabled(enabled);
      toast({
        title: enabled ? "Microphone enabled" : "Microphone disabled",
        description: `Microphone access has been ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error toggling microphone:', error);
      toast({
        title: "Error",
        description: "Failed to toggle microphone",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cameraEnabled,
    micEnabled,
    isLoading,
    toggleCamera,
    toggleMicrophone,
  };
};
