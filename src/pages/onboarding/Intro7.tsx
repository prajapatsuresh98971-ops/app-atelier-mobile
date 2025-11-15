import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { Bell } from "lucide-react";

const Intro7 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12 bg-background">
      <div className="w-full max-w-md space-y-8 flex-1 flex flex-col justify-center">
        <div className="flex justify-center mb-8">
          <div className="h-48 w-48 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Bell className="h-24 w-24 text-accent" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-foreground text-center">Real-Time Alerts</h2>
        
        <p className="text-lg text-muted-foreground text-center">
          Receive instant notifications about your child's activities and location changes
        </p>
      </div>
      
      <div className="w-full max-w-md space-y-4">
        <ProgressIndicator currentStep={6} totalSteps={7} />
        
        <Button 
          size="lg"
          className="w-full"
          onClick={() => navigate("/auth/login")}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Intro7;
