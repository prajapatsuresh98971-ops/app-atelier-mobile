import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Tablet, Monitor, MoreVertical, Unlink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Device {
  id: string;
  name: string;
  type: "phone" | "tablet" | "desktop";
  status: "online" | "offline";
  lastSeen: string;
  permissions: string[];
  paired: boolean;
}

const Devices = () => {
  const { toast } = useToast();
  const [showUnpairDialog, setShowUnpairDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "1",
      name: "Child's iPhone",
      type: "phone",
      status: "online",
      lastSeen: "Just now",
      permissions: ["Location", "Camera", "Screen Recording"],
      paired: true,
    },
    {
      id: "2",
      name: "Child's iPad",
      type: "tablet",
      status: "offline",
      lastSeen: "2 hours ago",
      permissions: ["Location"],
      paired: true,
    },
    {
      id: "3",
      name: "Parent's Phone",
      type: "phone",
      status: "online",
      lastSeen: "Just now",
      permissions: [],
      paired: false,
    },
  ]);

  const getDeviceIcon = (type: Device["type"]) => {
    switch (type) {
      case "phone":
        return Smartphone;
      case "tablet":
        return Tablet;
      case "desktop":
        return Monitor;
    }
  };

  const handleUnpair = (deviceId: string) => {
    setSelectedDevice(deviceId);
    setShowUnpairDialog(true);
  };

  const confirmUnpair = () => {
    if (selectedDevice) {
      setDevices(prev => prev.filter(d => d.id !== selectedDevice));
      toast({
        title: "Device Unpaired",
        description: "The device has been successfully unpaired",
      });
      setShowUnpairDialog(false);
      setSelectedDevice(null);
    }
  };

  return (
    <Layout title="Device Management">
      <div className="container max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Paired Devices */}
        <Card>
          <CardHeader>
            <CardTitle>Paired Devices</CardTitle>
            <CardDescription>
              Devices connected to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {devices.filter(d => d.paired).map((device) => {
              const Icon = getDeviceIcon(device.type);
              return (
                <div
                  key={device.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold">{device.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={device.status === "online" ? "default" : "secondary"}
                            className={device.status === "online" ? "bg-secondary" : ""}
                          >
                            {device.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {device.lastSeen}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUnpair(device.id)}>
                            <Unlink className="h-4 w-4 mr-2" />
                            Unpair Device
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {device.permissions.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Active Permissions:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {device.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* This Device */}
        <Card>
          <CardHeader>
            <CardTitle>Current Device</CardTitle>
            <CardDescription>
              The device you're using now
            </CardDescription>
          </CardHeader>
          <CardContent>
            {devices.filter(d => !d.paired).map((device) => {
              const Icon = getDeviceIcon(device.type);
              return (
                <div
                  key={device.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{device.name}</h4>
                    <Badge variant="default" className="bg-secondary mt-2">
                      {device.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Connection History */}
        <Card>
          <CardHeader>
            <CardTitle>Connection History</CardTitle>
            <CardDescription>
              Recent device connection activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "Device connected", device: "Child's iPhone", time: "Just now" },
                { action: "Device disconnected", device: "Child's iPad", time: "2 hours ago" },
                { action: "Permission updated", device: "Child's iPhone", time: "Yesterday" },
              ].map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{event.action}</p>
                    <p className="text-xs text-muted-foreground">{event.device}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{event.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unpair Confirmation Dialog */}
      <AlertDialog open={showUnpairDialog} onOpenChange={setShowUnpairDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpair Device?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the device from your account and stop all monitoring.
              The device owner will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnpair}>
              Unpair Device
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Devices;
