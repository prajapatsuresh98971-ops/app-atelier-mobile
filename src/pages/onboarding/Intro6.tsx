import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { Radio } from "lucide-react";

const Intro6 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12 bg-background">
      <div className="w-full max-w-md space-y-8 flex-1 flex flex-col justify-center">
        <div className="flex justify-center mb-8">
          <div className="h-48 w-48 rounded-2xl bg-secondary/10 flex items-center justify-center">
            <Radio className="h-24 w-24 text-secondary" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-foreground text-center">Device Finder</h2>
        
        <p className="text-lg text-muted-foreground text-center">
          Locate lost devices instantly and trigger alarms to help find them quickly
        </p>
      </div>
      
      <div className="w-full max-w-md space-y-4">
        <ProgressIndicator currentStep={5} totalSteps={7} />
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate("/auth/login")}
          >
            Skip
          </Button>
          <Button 
            className="flex-1"
            onClick={() => navigate("/onboarding/intro-7")}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Intro6;
