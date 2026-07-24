import { FormProgress } from "@/components/forms/form-progress";

export function AssessmentProgress({ step }: { step: number }) {
  return (
    <FormProgress step={step} totalSteps={8} label="Assessment progress" />
  );
}
