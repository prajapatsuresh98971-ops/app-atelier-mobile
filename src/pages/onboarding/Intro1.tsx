import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const Intro1 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center mb-8">
          <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-16 w-16 text-primary" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-foreground">Mobiprotect</h1>
        
        <p className="text-lg text-muted-foreground">
          Keep your family safe in the digital world with comprehensive parental controls and monitoring
        </p>
        
        <Button 
          size="lg" 
          className="w-full mt-8"
          onClick={() => navigate("/onboarding/intro-2")}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Intro1;
