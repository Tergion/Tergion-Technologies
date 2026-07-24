import type { z } from "zod";

import type { automationAssessmentSchema } from "@/features/assessments/assessment.schema";

export type AutomationAssessmentInput = z.input<
  typeof automationAssessmentSchema
>;
export type AutomationAssessment = z.output<typeof automationAssessmentSchema>;
