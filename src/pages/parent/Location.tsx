import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Shield, Bell, Navigation } from "lucide-react";
import { MapView } from "@/components/MapView";
import { supabase } from "@/integrations/supabase/client";

export default function Location() {
  const [locationAlerts, setLocationAlerts] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({ latitude: 40.7128, longitude: -74.0060 });

  useEffect(() => {
    const fetchLocation = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: pairing } = await (supabase as any)
        .from('device_pairings')
        .select('child_id')
        .eq('parent_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (pairing) {
        const { data: location } = await (supabase as any)
          .from('location_history')
          .select('*')
          .eq('user_id', pairing.child_id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

        if (location) {
          setCurrentLocation({
            latitude: location.latitude,
            longitude: location.longitude,
          });
        }
      }
    };

    fetchLocation();
  }, []);

  return (
    <Layout title="Location Tracking">
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto p-4 space-y-6">
          {/* Interactive Map */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Current Location
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Navigation className="h-4 w-4 mr-2" />
                  Directions
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden">
                <MapView 
                  latitude={currentLocation.latitude} 
                  longitude={currentLocation.longitude}
                  zoom={15}
                  showMarker={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabs for History and Settings */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="geofencing">Geofencing</TabsTrigger>
            </TabsList>

            {/* Location History */}
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Location History
                  </CardTitle>
                  <CardDescription>Recent location updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">123 Main Street</p>
                      <p className="text-xs text-muted-foreground">
                        Home • 2 minutes ago
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                    <MapPin className="h-5 w-5 text-secondary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">456 School Avenue</p>
                      <p className="text-xs text-muted-foreground">
                        School • 3 hours ago
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                    <MapPin className="h-5 w-5 text-accent mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">789 Park Road</p>
                      <p className="text-xs text-muted-foreground">
                        Friend's House • 5 hours ago
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distance & Time Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Distance from home</p>
                      <p className="text-2xl font-bold">0.2 mi</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Time away</p>
                      <p className="text-2xl font-bold">3h 45m</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Geofencing Settings */}
            <TabsContent value="geofencing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Safe Zones
                  </CardTitle>
                  <CardDescription>
                    Configure safe zones and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5" />
                      <Label htmlFor="alerts">Location Alerts</Label>
                    </div>
                    <Switch
                      id="alerts"
                      checked={locationAlerts}
                      onCheckedChange={setLocationAlerts}
                    />
                  </div>
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/10 border-secondary/20">
                      <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-secondary" />
                        <div>
                          <p className="text-sm font-medium">Home</p>
                          <p className="text-xs text-muted-foreground">123 Main Street</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/10 border-primary/20">
                      <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-primary" />
                        <div>
                          <p className="text-sm font-medium">School</p>
                          <p className="text-xs text-muted-foreground">456 School Avenue</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg bg-accent/10 border-accent/20">
                      <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-accent" />
                        <div>
                          <p className="text-sm font-medium">Friend's House</p>
                          <p className="text-xs text-muted-foreground">789 Park Road</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>

                  <Button className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Add New Safe Zone
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alert Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enter">Alert when entering safe zone</Label>
                    <Switch id="enter" defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label htmlFor="leave">Alert when leaving safe zone</Label>
                    <Switch id="leave" defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label htmlFor="extended">Alert after extended time away</Label>
                    <Switch id="extended" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <BottomTabBar />
    </Layout>
  );
}
