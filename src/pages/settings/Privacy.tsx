import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Download, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const Privacy = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    recordingEnabled: true,
    locationSharing: true,
    activityTracking: true,
    autoBackup: false,
    dataRetention: "30days",
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: "Setting Updated",
      description: "Your privacy preferences have been saved",
    });
  };

  const handleRetentionChange = (value: string) => {
    setSettings(prev => ({ ...prev, dataRetention: value }));
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export will be ready shortly. You'll receive an email with the download link.",
    });
  };

  const handleDeleteData = () => {
    toast({
      title: "Data Deleted",
      description: "All your recorded data has been permanently deleted",
      variant: "destructive",
    });
  };

  return (
    <Layout title="Privacy Settings">
      <div className="container max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle>Data Collection Preferences</CardTitle>
            <CardDescription>
              Control what data is collected and shared
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="recording">Screen Recording</Label>
                <p className="text-sm text-muted-foreground">
                  Allow recording of screen activity
                </p>
              </div>
              <Switch
                id="recording"
                checked={settings.recordingEnabled}
                onCheckedChange={() => handleToggle("recordingEnabled")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="location">Location Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Share real-time location data
                </p>
              </div>
              <Switch
                id="location"
                checked={settings.locationSharing}
                onCheckedChange={() => handleToggle("locationSharing")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="activity">Activity Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Track app usage and device activity
                </p>
              </div>
              <Switch
                id="activity"
                checked={settings.activityTracking}
                onCheckedChange={() => handleToggle("activityTracking")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="backup">Auto Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup data to cloud
                </p>
              </div>
              <Switch
                id="backup"
                checked={settings.autoBackup}
                onCheckedChange={() => handleToggle("autoBackup")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
            <CardDescription>
              How long to keep your activity data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="retention">Retention Period</Label>
              <Select value={settings.dataRetention} onValueChange={handleRetentionChange}>
                <SelectTrigger id="retention">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 Days</SelectItem>
                  <SelectItem value="30days">30 Days</SelectItem>
                  <SelectItem value="90days">90 Days</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Data older than this period will be automatically deleted
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Export or delete your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Export Your Data</h4>
              <p className="text-sm text-muted-foreground">
                Download a copy of all your data in JSON format
              </p>
              <Button variant="outline" onClick={handleExportData} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Delete Your Data</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete all collected data
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your
                      recorded data including location history, screenshots, and activity logs.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
            <CardDescription>
              Learn about how we protect your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="px-0">
              Read Full Privacy Policy →
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Privacy;
