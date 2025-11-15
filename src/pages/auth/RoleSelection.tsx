import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, UserCircle, Baby } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const RoleSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"parent" | "child" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setUserRole, user, role } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
    } else if (role) {
      navigate(role === "parent" ? "/parent/dashboard" : "/child/dashboard");
    }
  }, [user, role, navigate]);

  const handleContinue = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    const { error } = await setUserRole(selectedRole);

    if (error) {
      toast.error(error.message || "Failed to set role");
      setIsLoading(false);
    } else {
      toast.success("Role set successfully!");
      // Navigate directly to pairing screens
      navigate(selectedRole === "parent" ? "/parent/qr-scanner" : "/child/qr-display");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Choose Your Role</CardTitle>
          <CardDescription>
            Select how you'll be using Mobiprotect to set up your account correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedRole || ""}
            onValueChange={(value) => setSelectedRole(value as "parent" | "child")}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Parent Option */}
            <div className="relative">
              <RadioGroupItem 
                value="parent" 
                id="parent" 
                className="peer sr-only" 
              />
              <Label
                htmlFor="parent"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-card p-6 hover:bg-accent hover:border-primary cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
              >
                <UserCircle className="w-16 h-16 mb-4 text-primary" />
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-semibold">I'm a Parent</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor and manage your children's devices for their safety
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 pt-2">
                    <li>• Track location in real-time</li>
                    <li>• Monitor app usage</li>
                    <li>• Set screen time limits</li>
                    <li>• Access device controls</li>
                  </ul>
                </div>
              </Label>
            </div>

            {/* Child Option */}
            <div className="relative">
              <RadioGroupItem 
                value="child" 
                id="child" 
                className="peer sr-only" 
              />
              <Label
                htmlFor="child"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-card p-6 hover:bg-accent hover:border-primary cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
              >
                <Baby className="w-16 h-16 mb-4 text-primary" />
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-semibold">I'm a Child</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with your parent and allow them to help keep you safe
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 pt-2">
                    <li>• Share location with parent</li>
                    <li>• Simple device pairing</li>
                    <li>• Privacy controls</li>
                    <li>• Emergency features</li>
                  </ul>
                </div>
              </Label>
            </div>
          </RadioGroup>

          <div className="flex flex-col items-center space-y-4">
            <Button 
              size="lg" 
              className="w-full max-w-sm"
              disabled={!selectedRole || isLoading}
              onClick={handleContinue}
            >
              {isLoading ? "Setting up..." : "Continue"}
            </Button>
            <p className="text-xs text-muted-foreground text-center max-w-md">
              You can change your role later in account settings. Make sure to choose the role that matches how you'll be using the app.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSelection;
