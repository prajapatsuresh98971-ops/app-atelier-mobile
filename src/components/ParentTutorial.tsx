import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const tutorialSteps = [
  {
    title: "Welcome to Mobiprotect",
    description: "Let's take a quick tour to help you get started with monitoring your child's digital safety.",
    tip: "You can skip this tutorial at any time and access it later from Settings.",
  },
  {
    title: "Pair Your Child's Device",
    description: "Use the QR scanner to securely connect your child's device. They'll need to install the app and show you their QR code.",
    tip: "Best Practice: Always explain to your child why you're using monitoring software and set clear expectations together.",
    action: "Go to QR Scanner",
    actionRoute: "/parent/qr-scanner",
  },
  {
    title: "Set Up Safe Zones",
    description: "Create geofences around important locations like home and school. You'll get alerts when your child enters or leaves these areas.",
    tip: "Best Practice: Discuss safe zones with your child so they understand the monitoring is for their safety.",
    action: "Configure Geofences",
    actionRoute: "/settings/geofencing",
  },
  {
    title: "Monitor Activity & Location",
    description: "View real-time location, activity logs, and device status from your dashboard. You can also lock devices or access camera remotely if needed.",
    tip: "Best Practice: Use monitoring tools responsibly. Excessive surveillance can harm trust. Focus on safety, not control.",
  },
  {
    title: "Manage Notifications",
    description: "Customize which alerts you receive. You can enable browser notifications for critical events like geofence violations.",
    tip: "Enable high-priority alerts for urgent situations while keeping routine activity notifications minimal.",
  },
  {
    title: "Export Data",
    description: "Download your child's activity history, location data, and media files for record keeping in CSV or JSON format.",
    tip: "Regular data exports can help you review patterns and have meaningful conversations with your child.",
  },
  {
    title: "Digital Safety Best Practices",
    description: "Remember: Monitoring tools work best when combined with open communication. Talk to your child about online safety, privacy, and responsible device use.",
    tip: "Trust is built through dialogue, not just surveillance. Use these tools to facilitate conversations, not replace them.",
  },
];

export function ParentTutorial() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);

  useEffect(() => {
    checkTutorialStatus();
  }, [user]);

  const checkTutorialStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('is_completed')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const completed = data?.is_completed || false;
      setHasCompletedTutorial(completed);
      
      // Show tutorial if not completed
      if (!completed) {
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error checking tutorial status:', error);
    }
  };

  const markTutorialComplete = async () => {
    if (!user) return;

    try {
      await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          current_step: tutorialSteps.length,
          completed_steps: tutorialSteps.map((_, i) => i),
          is_completed: true,
        });

      setHasCompletedTutorial(true);
    } catch (error) {
      console.error('Error marking tutorial complete:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await markTutorialComplete();
    setIsOpen(false);
  };

  const handleComplete = async () => {
    await markTutorialComplete();
    setIsOpen(false);
  };

  const handleAction = () => {
    const step = tutorialSteps[currentStep];
    if (step.actionRoute) {
      window.location.href = step.actionRoute;
    }
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg relative animate-in fade-in zoom-in duration-300">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={handleSkip}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {currentStep + 1}/{tutorialSteps.length}
            </span>
          </div>
          <CardTitle className="flex items-center gap-2">
            {currentStep === tutorialSteps.length - 1 && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {step.title}
          </CardTitle>
          <CardDescription>{step.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="p-4 bg-primary/5 border-l-4 border-primary rounded">
            <p className="text-sm font-medium mb-1">💡 Tip</p>
            <p className="text-sm text-muted-foreground">{step.tip}</p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between gap-2">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep < tutorialSteps.length - 1 && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tutorial
              </Button>
            )}
            
            {step.action && step.actionRoute && (
              <Button variant="outline" onClick={handleAction}>
                {step.action}
              </Button>
            )}

            <Button onClick={handleNext}>
              {currentStep === tutorialSteps.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
