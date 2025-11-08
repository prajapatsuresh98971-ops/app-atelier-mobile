import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, role, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (user && role) {
        // Redirect authenticated users with roles to their dashboard
        navigate(role === "parent" ? "/parent/dashboard" : "/child/dashboard");
      } else if (user && !role) {
        // Redirect authenticated users without roles to role selection
        navigate("/auth/role-selection");
      }
    }
  }, [user, role, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">Mobiprotect</h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Keep your family safe with comprehensive digital parental control and monitoring
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Button 
            size="lg" 
            className="flex-1"
            onClick={() => navigate("/auth/login")}
          >
            Sign In
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/auth/register")}
          >
            Create Account
          </Button>
        </div>

        <div className="pt-8">
          <Button 
            variant="link" 
            onClick={() => navigate("/onboarding/intro-1")}
            className="text-muted-foreground"
          >
            Learn more about features →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
