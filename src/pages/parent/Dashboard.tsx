import { Layout } from "@/components/Layout";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, MapPin, Camera, Mic, Bell, Smartphone, Activity } from "lucide-react";

export default function ParentDashboard() {
  return (
    <Layout title="Dashboard">
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto p-4 space-y-6">
          {/* Connected Devices */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
              <CardDescription>Monitor your child's devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Sarah's iPhone</p>
                    <p className="text-sm text-muted-foreground">Last seen: 2 minutes ago</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-secondary">Online</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Alex's Android</p>
                    <p className="text-sm text-muted-foreground">Last seen: 1 hour ago</p>
                  </div>
                </div>
                <Badge variant="secondary">Offline</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <Lock className="h-6 w-6" />
                  <span className="text-sm">Lock Screen</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <MapPin className="h-6 w-6" />
                  <span className="text-sm">Find Device</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <Camera className="h-6 w-6" />
                  <span className="text-sm">Camera Access</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <Mic className="h-6 w-6" />
                  <span className="text-sm">Voice Recording</span>
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
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                <div className="h-2 w-2 rounded-full bg-secondary mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">App opened: Instagram</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Location changed</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                <div className="h-2 w-2 rounded-full bg-accent mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Screen time: 2 hours today</p>
                  <p className="text-xs text-muted-foreground">30 minutes ago</p>
                </div>
              </div>
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
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 border border-accent/50 rounded-lg bg-accent/10">
                <Bell className="h-5 w-5 text-accent mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Geofence Alert</p>
                  <p className="text-xs text-muted-foreground">Sarah left the safe zone - Home</p>
                  <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Map Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Current Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Map integration coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomTabBar />
    </Layout>
  );
}
