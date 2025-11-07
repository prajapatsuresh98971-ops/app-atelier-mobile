import { useState } from "react";
import { Layout } from "@/components/Layout";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Monitor, Camera, Circle, Maximize2, PlayCircle, StopCircle } from "lucide-react";

export default function LiveMonitoring() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <Layout title="Live Monitoring">
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto p-4 space-y-6">
          {/* Screen View */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Live Screen View
                </CardTitle>
                <Badge variant="default" className="bg-secondary">
                  <Circle className="h-2 w-2 mr-1 fill-current animate-pulse" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="text-center">
                  <Monitor className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Screen view will appear here</p>
                  <p className="text-xs text-muted-foreground mt-1">Waiting for connection...</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Recording Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  onClick={() => setIsRecording(!isRecording)}
                  className="flex items-center gap-2"
                >
                  {isRecording ? (
                    <>
                      <StopCircle className="h-4 w-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      Start Recording
                    </>
                  )}
                </Button>
                <Button variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Screenshot
                </Button>
              </div>

              {isRecording && (
                <div className="flex items-center justify-center gap-2 text-sm text-destructive">
                  <Circle className="h-2 w-2 fill-current animate-pulse" />
                  Recording: 00:45
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground w-16">2:45 PM</div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Monitor className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Opened Instagram</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground w-16">2:30 PM</div>
                  <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Monitor className="h-4 w-4 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Closed TikTok</p>
                    <p className="text-xs text-muted-foreground">17 minutes ago</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground w-16">2:15 PM</div>
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Monitor className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Started TikTok</p>
                    <p className="text-xs text-muted-foreground">32 minutes ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>App Usage Today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Monitor className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">TikTok</p>
                    <p className="text-xs text-muted-foreground">Social Media</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">2h 34m</p>
                  <p className="text-xs text-muted-foreground">45% of screen time</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Monitor className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Instagram</p>
                    <p className="text-xs text-muted-foreground">Social Media</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">1h 12m</p>
                  <p className="text-xs text-muted-foreground">21% of screen time</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Monitor className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">YouTube</p>
                    <p className="text-xs text-muted-foreground">Entertainment</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">45m</p>
                  <p className="text-xs text-muted-foreground">13% of screen time</p>
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
