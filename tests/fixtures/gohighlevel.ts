import {
  automationAssessmentFieldContract,
  type AutomationAssessmentFieldId,
} from "@/features/leads/gohighlevel-assessment-mapping";

export const testGoHighLevelSchemaKey =
  "custom_objects.automation_assessment";
export const testGoHighLevelAssociationKey =
  "automation_assessments_submitted_by";
export const testGoHighLevelAssociationId = "association-synthetic";
export const testGoHighLevelLocationId = "location-123";

export function makeGoHighLevelContact(
  overrides: Partial<{
    id: string;
    locationId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName: string;
    website: string;
    timezone: string;
  }> = {},
) {
  return {
    id: "contact-123",
    locationId: testGoHighLevelLocationId,
    firstName: "Test",
    lastName: "Person",
    email: "test@example.com",
    phone: "+15551234567",
    companyName: "Example Business",
    website: "https://example.com",
    timezone: "America/Los_Angeles",
    ...overrides,
  };
}

export const testAssessmentPropertyKeys = {
  assessmentReference: "assessment_reference",
  preferredContactMethod: "preferred_contact_method",
  schedulingPreference: "scheduling_preference",
  industry: "industry",
  monthlyLeadRange: "monthly_lead_range",
  customerValueRange: "average_customer_value",
  websiteInquiryProcess: "website_inquiry_process",
  incomingCallOwner: "incoming_call_owner",
  incomingCallOwnerOther: "incoming_call_owner_other",
  missedCallProcess: "missed_call_process",
  leadResponseTime: "lead_response_time",
  quoteFollowUpProcess: "quote_follow_up_process",
  pipelineVisibility: "pipeline_visibility",
  leadTrackingMethod: "lead_tracking_method",
  biggestChallenge: "biggest_challenge",
  biggestChallengeOther: "biggest_challenge_other",
  assessmentFollowUpPreference: "assessment_follow_up_preference",
  additionalNotes: "additional_notes",
  contactConsent: "contact_consent",
  privacyTermsConsent: "privacy_terms_consent",
  smsConsent: "sms_consent",
} as const satisfies Record<AutomationAssessmentFieldId, string>;

function optionStoredValue(
  fieldId: AutomationAssessmentFieldId,
  websiteValue: string,
) {
  return `stored_${fieldId}_${websiteValue}`;
}

export function getTestGoHighLevelOptionValue(
  fieldId: AutomationAssessmentFieldId,
  websiteValue: string,
) {
  return optionStoredValue(fieldId, websiteValue);
}

export function makeGoHighLevelAssessmentSchemaResponse() {
  const referenceFieldKey =
    `${testGoHighLevelSchemaKey}.` +
    testAssessmentPropertyKeys.assessmentReference;

  return {
    object: {
      id: "schema-synthetic",
      key: testGoHighLevelSchemaKey,
      labels: {
        singular: "Automation Assessment",
        plural: "Automation Assessments",
      },
      primaryDisplayProperty: referenceFieldKey,
      searchableProperties: [referenceFieldKey],
    },
    fields: (
      Object.entries(automationAssessmentFieldContract) as Array<
        [
          AutomationAssessmentFieldId,
          (typeof automationAssessmentFieldContract)[AutomationAssessmentFieldId],
        ]
      >
    ).map(([fieldId, contract]) => ({
      name: contract.label,
      dataType: contract.dataType,
      fieldKey:
        `${testGoHighLevelSchemaKey}.` +
        testAssessmentPropertyKeys[fieldId],
      ...("options" in contract
        ? {
            options: contract.options.map((option) => ({
              key: optionStoredValue(fieldId, option.value),
              label: option.label,
            })),
          }
        : {}),
    })),
    cache: true,
  };
}

export function makeGoHighLevelAssessmentAssociation(
  orientation: "assessment-first" | "contact-first" =
    "assessment-first",
) {
  const assessmentFirst = orientation === "assessment-first";

  return {
    locationId: testGoHighLevelLocationId,
    id: testGoHighLevelAssociationId,
    key: testGoHighLevelAssociationKey,
    firstObjectLabel: assessmentFirst
      ? "Automation Assessments"
      : "Submitted By",
    firstObjectKey: assessmentFirst
      ? testGoHighLevelSchemaKey
      : "contact",
    secondObjectLabel: assessmentFirst
      ? "Submitted By"
      : "Automation Assessments",
    secondObjectKey: assessmentFirst
      ? "contact"
      : testGoHighLevelSchemaKey,
    associationType: "USER_DEFINED",
  };
}
