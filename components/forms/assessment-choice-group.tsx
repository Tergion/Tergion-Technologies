import { FormChoiceGroup } from "@/components/forms/shared/form-choice-group";
import type { AutomationAssessmentInput } from "@/features/assessments/assessment.types";
import type { ComponentProps } from "react";

type AssessmentChoiceGroupProps = ComponentProps<
  typeof FormChoiceGroup<AutomationAssessmentInput>
>;

export function AssessmentChoiceGroup(props: AssessmentChoiceGroupProps) {
  return (
    <FormChoiceGroup<AutomationAssessmentInput>
      {...props}
      idPrefix="assessment-"
    />
  );
}
