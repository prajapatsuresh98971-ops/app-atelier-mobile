import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, Settings, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChildDashboard = () => {
  const navigate = useNavigate();

  return (
    <Layout title="My Dashboard">
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Connection Status */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Connection Status</CardTitle>
              </div>
              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            </div>
            <CardDescription>
              Your device is connected to your parent's account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Connected Parent</p>
                <p className="text-xs text-muted-foreground">Parent Account</p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Device Information */}
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
            <CardDescription>Your current device details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Device Name</p>
                <p className="text-sm font-medium">My Phone</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="text-sm font-medium text-secondary">Online</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Last Sync</p>
                <p className="text-sm font-medium">Just now</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Battery</p>
                <p className="text-sm font-medium">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Active Permissions</CardTitle>
            <CardDescription>Permissions granted to parent account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {["Location", "Camera", "Microphone", "Screen Recording"].map((permission) => (
                <div key={permission} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium">{permission}</span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate("/pairing/permissions")}
            >
              Manage Permissions
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-2"
            onClick={() => navigate("/settings/privacy")}
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm">Privacy Settings</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-2"
            onClick={() => navigate("/help/support")}
          >
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm">Help & Support</span>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ChildDashboard;
