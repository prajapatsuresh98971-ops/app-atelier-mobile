import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Camera, MapPin, Mic, Monitor, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { usePairing } from "@/hooks/usePairing";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

const Permissions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role } = useAuth();
  const { acceptPairing, isLoading } = usePairing();
  const [pairingId, setPairingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingPairing = async () => {
      if (!user || role !== 'child') return;

      const { data, error } = await (supabase as any)
        .from('device_pairings')
        .select('*')
        .eq('child_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setPairingId(data.id);
      }
    };

    fetchPendingPairing();
  }, [user, role]);

  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: "camera",
      name: "Camera Access",
      description: "Allow parent to access device camera remotely",
      icon: Camera,
      enabled: true,
    },
    {
      id: "location",
      name: "Location Tracking",
      description: "Share your real-time location with parent",
      icon: MapPin,
      enabled: true,
    },
    {
      id: "microphone",
      name: "Microphone Access",
      description: "Allow parent to record audio from device",
      icon: Mic,
      enabled: false,
    },
    {
      id: "screen",
      name: "Screen Recording",
      description: "Allow parent to view and record your screen",
      icon: Monitor,
      enabled: true,
    },
  ]);

  const handleTogglePermission = (id: string) => {
    setPermissions(prev =>
      prev.map(p => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleGrantPermissions = async () => {
    if (!pairingId) {
      toast({
        title: "No Pairing Found",
        description: "Navigating to dashboard",
      });
      navigate("/child/dashboard");
      return;
    }

    const permissionsObj = {
      camera: permissions.find(p => p.id === "camera")?.enabled || false,
      location: permissions.find(p => p.id === "location")?.enabled || false,
      microphone: permissions.find(p => p.id === "microphone")?.enabled || false,
      screen_recording: permissions.find(p => p.id === "screen")?.enabled || false,
    };

    try {
      await acceptPairing(pairingId, permissionsObj);
      navigate("/child/dashboard");
    } catch (error) {
      console.error('Failed to grant permissions:', error);
    }
  };

  const handleSkip = () => {
    navigate("/child/dashboard");
  };

  return (
    <Layout title="Manage Permissions" showHeader={false}>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
        <div className="container max-w-2xl mx-auto py-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Permission Settings</h1>
            <p className="text-muted-foreground">
              Choose what your parent can access on your device
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You can change these permissions anytime from your dashboard settings.
              Your parent will be notified of any changes.
            </AlertDescription>
          </Alert>

          {/* Permissions List */}
          <Card>
            <CardHeader>
              <CardTitle>Available Permissions</CardTitle>
              <CardDescription>
                Toggle permissions on or off based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {permissions.map((permission) => {
                const Icon = permission.icon;
                return (
                  <div
                    key={permission.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="mt-1">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label htmlFor={permission.id} className="text-base font-semibold cursor-pointer">
                        {permission.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                    <Switch
                      id={permission.id}
                      checked={permission.enabled}
                      onCheckedChange={() => handleTogglePermission(permission.id)}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">
                  {permissions.filter(p => p.enabled).length} of {permissions.length} permissions enabled
                </p>
                <p className="text-xs text-muted-foreground">
                  These permissions help your parent keep you safe while respecting your privacy
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleGrantPermissions}
              className="flex-1"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Grant Permissions"}
            </Button>
            <Button
              onClick={handleSkip}
              variant="outline"
              className="flex-1 sm:flex-initial"
              size="lg"
            >
              Skip for Now
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Permissions;
