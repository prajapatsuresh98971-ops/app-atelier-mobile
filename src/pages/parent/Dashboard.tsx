import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Lock, 
  MapPin, 
  Camera, 
  Bell, 
  Activity,
  Users,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimePairing } from "@/hooks/useRealtimePairing";
import { PairedChildCard } from "@/components/PairedChildCard";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [pairedChildren, setPairedChildren] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPairedChildren = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('device_pairings')
        .select(`
          *,
          child:profiles!device_pairings_child_id_fkey(id, name, email),
          child_device:devices!devices_user_id_fkey(is_online, last_seen)
        `)
        .eq('parent_id', user.id)
        .eq('is_active', true)
        .eq('status', 'active');

      if (error) throw error;

      const formattedChildren = data?.map((pairing: any) => ({
        id: pairing.child?.id,
        name: pairing.child?.name || 'Unknown',
        email: pairing.child?.email || '',
        is_online: pairing.child_device?.[0]?.is_online || false,
        last_seen: pairing.child_device?.[0]?.last_seen || new Date().toISOString(),
      })) || [];

      setPairedChildren(formattedChildren);
    } catch (error) {
      console.error('Error fetching paired children:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    if (!user) return;

    try {
      // Get all child IDs
      const { data: pairings } = await (supabase as any)
        .from('device_pairings')
        .select('child_id')
        .eq('parent_id', user.id)
        .eq('is_active', true);

      if (!pairings || pairings.length === 0) return;

      const childIds = pairings.map((p: any) => p.child_id);

      const { data, error } = await (supabase as any)
        .from('activity_logs')
        .select('*')
        .in('user_id', childIds)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  useEffect(() => {
    fetchPairedChildren();
    fetchRecentActivity();
  }, [user]);

  useRealtimePairing(() => {
    fetchPairedChildren();
  });

  // Listen to activity updates in real-time
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('activity-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
        },
        () => {
          fetchRecentActivity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleDeviceLock = async (childId: string, action: 'lock' | 'unlock') => {
    try {
      const { error } = await supabase.functions.invoke('device-lock', {
        body: { child_id: childId, action },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Device ${action} command sent`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} device`,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout title="Dashboard">
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto p-4 space-y-6">
          {/* Connected Devices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Paired Children
                </CardTitle>
                <CardDescription>Devices paired with your account</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/parent/qr-scanner')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Child
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : pairedChildren.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-muted-foreground">No paired children yet</p>
                  <Button onClick={() => navigate('/parent/qr-scanner')}>
                    Pair Your First Device
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {pairedChildren.map((child) => (
                    <PairedChildCard
                      key={child.id}
                      child={child}
                      onViewLocation={() => navigate('/parent/location')}
                      onViewActivity={() => navigate('/parent/live-monitoring')}
                      onLockDevice={() => handleDeviceLock(child.id, 'lock')}
                      onUnlockDevice={() => handleDeviceLock(child.id, 'unlock')}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2"
                  onClick={() => navigate('/parent/device-controls')}
                >
                  <Lock className="h-6 w-6" />
                  <span className="text-sm">Device Control</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2"
                  onClick={() => navigate('/parent/location')}
                >
                  <MapPin className="h-6 w-6" />
                  <span className="text-sm">Location</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2"
                  onClick={() => navigate('/parent/qr-scanner')}
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-sm">Pair Device</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2"
                  onClick={() => navigate('/parent/live-monitoring')}
                >
                  <Activity className="h-6 w-6" />
                  <span className="text-sm">Monitoring</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No recent activity</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-4">No alerts</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomTabBar />
    </Layout>
  );
}
