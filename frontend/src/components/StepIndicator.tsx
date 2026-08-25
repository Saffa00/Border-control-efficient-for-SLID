interface StepIndicatorProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <ol className="flex items-center w-full mb-10">
      {steps.map((label, i) => {
        const isComplete = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <li key={label} className="flex-1 flex items-center">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-sm border-2 ${
                  isComplete
                    ? "bg-primary border-primary text-white"
                    : isCurrent
                    ? "border-primary text-primary"
                    : "border-primary-light text-ink-soft"
                }`}
              >
                {isComplete ? "✓" : i + 1}
              </div>
              <span
                className={`mt-2 text-xs text-center max-w-[90px] ${
                  isCurrent ? "text-ink font-medium" : "text-ink-soft"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 ${isComplete ? "bg-primary" : "bg-primary-light"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
