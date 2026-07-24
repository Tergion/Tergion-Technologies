import {
  assessmentFollowUpPreferenceOptions,
  assessmentPreferredContactMethods,
  biggestChallengeOptions,
  customerValueRangeOptions,
  incomingCallOwnerOptions,
  leadResponseTimeOptions,
  leadTrackingMethodOptions,
  missedCallProcessOptions,
  monthlyLeadRangeOptions,
  pipelineVisibilityOptions,
  quoteFollowUpProcessOptions,
  websiteInquiryProcessOptions,
} from "@/features/assessments/assessment.constants";
import type { AutomationAssessment } from "@/features/assessments/assessment.types";

export type AssessmentDetail = {
  label: string;
  value: string;
  multiline?: boolean;
};

export type AssessmentDetailSection = {
  title: string;
  details: AssessmentDetail[];
};

type Option = { value: string; label: string };

function optionLabel(options: readonly Option[], value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return options.find((option) => option.value === value)?.label;
}

function compactDetails(details: Array<AssessmentDetail | undefined>) {
  return details.filter(
    (detail): detail is AssessmentDetail => Boolean(detail?.value.trim()),
  );
}

export function getAssessmentFollowUpPreferenceLabel(
  assessment: Pick<AutomationAssessment, "assessmentFollowUpPreference">,
) {
  return (
    optionLabel(
      assessmentFollowUpPreferenceOptions,
      assessment.assessmentFollowUpPreference,
    ) ?? "Not provided"
  );
}

export function getAssessmentContactPreferenceLabel(
  assessment: Pick<AutomationAssessment, "preferredContactMethod">,
) {
  return (
    optionLabel(
      assessmentPreferredContactMethods,
      assessment.preferredContactMethod,
    ) ?? "Not provided"
  );
}

export function getAssessmentDetailSections(
  assessment: AutomationAssessment,
): AssessmentDetailSection[] {
  const incomingCallOwner = optionLabel(
    incomingCallOwnerOptions,
    assessment.incomingCallOwner,
  );
  const biggestChallenge = optionLabel(
    biggestChallengeOptions,
    assessment.biggestChallenge,
  );

  return [
    {
      title: "Contact",
      details: compactDetails([
        {
          label: "Name",
          value: [assessment.firstName, assessment.lastName]
            .filter(Boolean)
            .join(" "),
        },
        { label: "Business", value: assessment.businessName },
        { label: "Email", value: assessment.email },
        { label: "Phone", value: assessment.phone },
        {
          label: "Best way to reach you",
          value: getAssessmentContactPreferenceLabel(assessment),
        },
        assessment.schedulingPreference
          ? {
              label: "Scheduling preference",
              value: assessment.schedulingPreference,
            }
          : undefined,
      ]),
    },
    {
      title: "Business Profile",
      details: compactDetails([
        { label: "Industry", value: assessment.industry },
        {
          label: "Monthly leads",
          value:
            optionLabel(monthlyLeadRangeOptions, assessment.monthlyLeadRange) ??
            "Not provided",
        },
        assessment.customerValueRange
          ? {
              label: "Average customer value",
              value:
                optionLabel(
                  customerValueRangeOptions,
                  assessment.customerValueRange,
                ) ?? "Not provided",
            }
          : undefined,
      ]),
    },
    {
      title: "Lead Intake",
      details: compactDetails([
        assessment.websiteInquiryProcess
          ? {
              label: "Website or message response",
              value:
                optionLabel(
                  websiteInquiryProcessOptions,
                  assessment.websiteInquiryProcess,
                ) ?? "Not provided",
            }
          : undefined,
        {
          label: "Incoming calls answered by",
          value:
            assessment.incomingCallOwner === "other"
              ? `Other — ${assessment.incomingCallOwnerOther}`
              : incomingCallOwner ?? "Not provided",
        },
        {
          label: "Missed-call process",
          value:
            optionLabel(
              missedCallProcessOptions,
              assessment.missedCallProcess,
            ) ?? "Not provided",
        },
      ]),
    },
    {
      title: "Response and Visibility",
      details: compactDetails([
        {
          label: "Lead response time",
          value:
            optionLabel(
              leadResponseTimeOptions,
              assessment.leadResponseTime,
            ) ?? "Not provided",
        },
        assessment.quoteFollowUpProcess
          ? {
              label: "Quote follow-up",
              value:
                optionLabel(
                  quoteFollowUpProcessOptions,
                  assessment.quoteFollowUpProcess,
                ) ?? "Not provided",
            }
          : undefined,
        assessment.pipelineVisibility
          ? {
              label: "Pipeline visibility",
              value:
                optionLabel(
                  pipelineVisibilityOptions,
                  assessment.pipelineVisibility,
                ) ?? "Not provided",
            }
          : undefined,
      ]),
    },
    {
      title: "Systems and Challenge",
      details: compactDetails([
        assessment.leadTrackingMethod
          ? {
              label: "Lead and customer tracking",
              value:
                optionLabel(
                  leadTrackingMethodOptions,
                  assessment.leadTrackingMethod,
                ) ?? "Not provided",
            }
          : undefined,
        {
          label: "Biggest challenge",
          value:
            assessment.biggestChallenge === "other"
              ? `Other — ${assessment.biggestChallengeOther}`
              : biggestChallenge ?? "Not provided",
        },
      ]),
    },
    {
      title: "Next Step",
      details: compactDetails([
        {
          label: "Assessment follow-up preference",
          value: getAssessmentFollowUpPreferenceLabel(assessment),
        },
        assessment.additionalNotes
          ? {
              label: "Additional notes",
              value: assessment.additionalNotes,
              multiline: true,
            }
          : undefined,
      ]),
    },
  ];
}
