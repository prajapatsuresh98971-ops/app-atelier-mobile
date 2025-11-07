import { useState } from "react";
import { Layout } from "@/components/Layout";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Lock, Unlock, MapPin, Bell, Camera, Mic, Shield, Smartphone } from "lucide-react";

export default function DeviceControls() {
  const [screenLocked, setScreenLocked] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  return (
    <Layout title="Device Controls">
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto p-4 space-y-6">
          {/* Screen Lock Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Screen Control
              </CardTitle>
              <CardDescription>
                Lock or unlock the device screen remotely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  {screenLocked ? (
                    <Lock className="h-8 w-8 text-destructive" />
                  ) : (
                    <Unlock className="h-8 w-8 text-secondary" />
                  )}
                  <div>
                    <Label className="text-base font-medium">
                      Screen Lock
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {screenLocked ? "Device is locked" : "Device is unlocked"}
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Switch checked={screenLocked} />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {screenLocked ? "Unlock Device?" : "Lock Device?"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {screenLocked
                          ? "This will unlock Sarah's iPhone and allow normal usage."
                          : "This will lock Sarah's iPhone and prevent usage until unlocked."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => setScreenLocked(!screenLocked)}
                      >
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <Button variant="outline" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Emergency Unlock
              </Button>
            </CardContent>
          </Card>

          {/* App-Specific Controls */}
          <Card>
            <CardHeader>
              <CardTitle>App Restrictions</CardTitle>
              <CardDescription>
                Control access to specific applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm font-medium">TikTok</p>
                    <p className="text-xs text-muted-foreground">Social Media</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-6 w-6 text-secondary" />
                  <div>
                    <p className="text-sm font-medium">Instagram</p>
                    <p className="text-xs text-muted-foreground">Social Media</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-6 w-6 text-accent" />
                  <div>
                    <p className="text-sm font-medium">YouTube</p>
                    <p className="text-xs text-muted-foreground">Entertainment</p>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Device Finder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Device Finder
              </CardTitle>
              <CardDescription>
                Locate or play alarm on the device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="default" className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                Locate Device
              </Button>
              <Button variant="outline" className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Play Alarm
              </Button>
            </CardContent>
          </Card>

          {/* Media Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Media Access</CardTitle>
              <CardDescription>
                Control camera and microphone permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5" />
                  <Label htmlFor="camera">Camera Access</Label>
                </div>
                <Switch
                  id="camera"
                  checked={cameraEnabled}
                  onCheckedChange={setCameraEnabled}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mic className="h-5 w-5" />
                  <Label htmlFor="microphone">Microphone Access</Label>
                </div>
                <Switch
                  id="microphone"
                  checked={micEnabled}
                  onCheckedChange={setMicEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Control History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Control Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                <Lock className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Screen locked</p>
                  <p className="text-xs text-muted-foreground">Today at 3:45 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                <Smartphone className="h-5 w-5 text-accent mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">TikTok access restricted</p>
                  <p className="text-xs text-muted-foreground">Today at 2:30 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Device located</p>
                  <p className="text-xs text-muted-foreground">Today at 1:15 PM</p>
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
