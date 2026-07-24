export function FormProgress({
  step,
  totalSteps,
  label,
}: {
  step: number;
  totalSteps: number;
  label: string;
}) {
  const percentage = (step / totalSteps) * 100;

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center justify-between gap-4 text-xs font-semibold text-muted-foreground">
        <span>
          Step {step} of {totalSteps}
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[var(--field-bg-muted)]"
        role="progressbar"
        aria-label={`${label}: step ${step} of ${totalSteps}`}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={step}
      >
        <div
          className="h-full rounded-full bg-primary transition-transform duration-200 motion-reduce:transition-none"
          style={{
            transform: `translateX(-${100 - percentage}%)`,
            transformOrigin: "left",
          }}
        />
      </div>
    </div>
  );
}
