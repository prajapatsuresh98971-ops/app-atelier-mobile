import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { MapPin } from "lucide-react";

const Intro2 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12 bg-background">
      <div className="w-full max-w-md space-y-8 flex-1 flex flex-col justify-center">
        <div className="flex justify-center mb-8">
          <div className="h-48 w-48 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MapPin className="h-24 w-24 text-primary" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-foreground text-center">Real-Time Location Tracking</h2>
        
        <p className="text-lg text-muted-foreground text-center">
          Know where your children are at all times with accurate GPS tracking and location history
        </p>
      </div>
      
      <div className="w-full max-w-md space-y-4">
        <ProgressIndicator currentStep={1} totalSteps={7} />
        
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
            onClick={() => navigate("/onboarding/intro-3")}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Intro2;
