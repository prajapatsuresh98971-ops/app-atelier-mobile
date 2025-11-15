interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          key={index}
          className={`h-2 rounded-full transition-all ${
            index < currentStep
              ? "w-8 bg-primary"
              : index === currentStep
              ? "w-12 bg-primary"
              : "w-2 bg-muted"
          }`}
        />
      ))}
    </div>
  );
};
