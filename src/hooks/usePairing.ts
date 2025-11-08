import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePairing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generatePairingCode = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-pairing-code');
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate pairing code",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validatePairingCode = async (pairingCode: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-pairing-code', {
        body: { pairing_code: pairingCode },
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Pairing code validated. Waiting for child to accept.",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid pairing code",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptPairing = async (pairingId: string, permissions: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('accept-pairing', {
        body: { pairing_id: pairingId, permissions },
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Pairing accepted successfully!",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept pairing",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    generatePairingCode,
    validatePairingCode,
    acceptPairing,
  };
};
