import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  action?: string;
}

export const onboardingSteps: OnboardingStep[] = [
  {
    id: 0,
    title: "Welcome to Mobiprotect",
    description: "Let's set up your family's digital safety in just a few steps",
  },
  {
    id: 1,
    title: "Pair Your Child's Device",
    description: "Use QR code scanning to securely connect your child's device",
    action: "/parent/qr-scanner",
  },
  {
    id: 2,
    title: "Grant Permissions",
    description: "Allow necessary permissions for monitoring features",
  },
  {
    id: 3,
    title: "Set Up Safe Zones",
    description: "Create geofences for important locations like home and school",
    action: "/settings/geofencing",
  },
  {
    id: 4,
    title: "Configure Reports",
    description: "Set up weekly email summaries of your child's activity",
    action: "/settings/reports",
  },
  {
    id: 5,
    title: "All Set!",
    description: "Your monitoring system is ready. Start protecting your family today",
  },
];

export const useOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setCurrentStep(data.current_step);
        setCompletedSteps(data.completed_steps || []);
        setIsCompleted(data.is_completed);
      }
    } catch (error) {
      console.error('Error fetching onboarding progress:', error);
    }
  };

  const updateProgress = async (step: number, completed: boolean = false) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newCompletedSteps = completed && !completedSteps.includes(step)
        ? [...completedSteps, step]
        : completedSteps;

      const { error } = await (supabase as any)
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          current_step: step,
          completed_steps: newCompletedSteps,
          is_completed: step >= onboardingSteps.length - 1,
        });

      if (error) throw error;

      setCurrentStep(step);
      setCompletedSteps(newCompletedSteps);
      if (step >= onboardingSteps.length - 1) {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      updateProgress(currentStep + 1, true);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      updateProgress(currentStep - 1);
    }
  };

  const skipOnboarding = async () => {
    await updateProgress(onboardingSteps.length - 1, true);
  };

  return {
    currentStep,
    completedSteps,
    isCompleted,
    isLoading,
    totalSteps: onboardingSteps.length,
    currentStepData: onboardingSteps[currentStep],
    nextStep,
    previousStep,
    skipOnboarding,
    updateProgress,
  };
};
