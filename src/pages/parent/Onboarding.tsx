import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useOnboarding, onboardingSteps } from "@/hooks/useOnboarding";
import { CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const {
    currentStep,
    completedSteps,
    isCompleted,
    totalSteps,
    currentStepData,
    nextStep,
    previousStep,
    skipOnboarding,
  } = useOnboarding();

  const handleAction = () => {
    if (currentStepData.action) {
      navigate(currentStepData.action);
    } else {
      nextStep();
    }
  };

  const handleSkip = async () => {
    await skipOnboarding();
    navigate('/parent/dashboard');
  };

  const handleComplete = () => {
    navigate('/parent/dashboard');
  };

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <Layout title="Setup Guide">
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl glass-card glow-primary">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-3xl gradient-text">
                {currentStepData.title}
              </CardTitle>
            </div>
            <CardDescription className="text-lg">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {currentStep + 1} of {totalSteps}</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2 animate-glow" />
            </div>

            {/* Steps Overview */}
            <div className="grid gap-3">
              {onboardingSteps.map((step) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    step.id === currentStep
                      ? 'border-primary bg-primary/10 glow-primary'
                      : completedSteps.includes(step.id)
                      ? 'border-secondary bg-secondary/10'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle2 className="h-6 w-6 text-secondary" />
                    ) : (
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                        step.id === currentStep ? 'border-primary text-primary' : 'border-muted text-muted-foreground'
                      }`}>
                        {step.id + 1}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className={`font-semibold ${step.id === currentStep ? 'text-primary' : ''}`}>
                        {step.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 0 && !isCompleted && (
                <Button
                  variant="outline"
                  onClick={previousStep}
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              
              {!isCompleted ? (
                <>
                  <Button
                    onClick={handleAction}
                    className="flex-1 glow-primary"
                  >
                    {currentStepData.action ? 'Go to Setup' : 'Next Step'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                  >
                    Skip
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="flex-1 glow-primary"
                >
                  Go to Dashboard
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
