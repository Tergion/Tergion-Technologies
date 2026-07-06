import { cn } from "@/lib/utils";

const steps = ["Basics", "Context", "Review"];

export function FormProgress({ currentStep }: { currentStep: number }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Request progress">
      {steps.map((step, index) => (
        <li key={step}>
          <div
            className={cn(
              "h-1.5 rounded-full bg-[var(--field-bg-muted)]",
              index <= currentStep && "bg-primary",
            )}
          />
          <p
            className={cn(
              "mt-2 text-xs font-medium text-muted-foreground",
              index === currentStep && "text-foreground",
            )}
          >
            {step}
          </p>
        </li>
      ))}
    </ol>
  );
}
