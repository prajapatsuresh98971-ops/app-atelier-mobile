import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Geofence {
  id: string;
  parent_id: string;
  child_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  is_active: boolean;
  notify_on_enter: boolean;
  notify_on_exit: boolean;
  created_at: string;
  updated_at: string;
}

export const useGeofences = (childId?: string) => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchGeofences = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = (supabase as any)
        .from('geofences')
        .select('*')
        .eq('parent_id', user.id);

      if (childId) {
        query = query.eq('child_id', childId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setGeofences(data || []);
    } catch (error) {
      console.error('Error fetching geofences:', error);
      toast({
        title: "Error",
        description: "Failed to load geofences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGeofences();
  }, [childId]);

  const createGeofence = async (geofence: Partial<Geofence>) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('geofences')
        .insert({
          parent_id: user.id,
          ...geofence,
        })
        .select()
        .single();

      if (error) throw error;

      setGeofences([...geofences, data]);
      toast({
        title: "Success",
        description: "Safe zone created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating geofence:', error);
      toast({
        title: "Error",
        description: "Failed to create safe zone",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGeofence = async (id: string, updates: Partial<Geofence>) => {
    try {
      setIsLoading(true);
      const { data, error } = await (supabase as any)
        .from('geofences')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setGeofences(geofences.map(g => g.id === id ? data : g));
      toast({
        title: "Success",
        description: "Safe zone updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating geofence:', error);
      toast({
        title: "Error",
        description: "Failed to update safe zone",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGeofence = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await (supabase as any)
        .from('geofences')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGeofences(geofences.filter(g => g.id !== id));
      toast({
        title: "Success",
        description: "Safe zone deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting geofence:', error);
      toast({
        title: "Error",
        description: "Failed to delete safe zone",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    geofences,
    isLoading,
    createGeofence,
    updateGeofence,
    deleteGeofence,
    refetch: fetchGeofences,
  };
};
