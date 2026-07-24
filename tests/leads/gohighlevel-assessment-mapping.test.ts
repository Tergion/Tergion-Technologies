import { describe, expect, it } from "vitest";

import type { AutomationAssessment } from "@/features/assessments/assessment.types";
import {
  automationAssessmentFieldContract,
  buildAutomationAssessmentProperties,
  compileAutomationAssessmentMapping,
  GoHighLevelAssessmentMappingError,
  type AutomationAssessmentFieldId,
  type GoHighLevelAssessmentMappingErrorCode,
} from "@/features/leads/gohighlevel-assessment-mapping";
import { makeAssessmentSubmission } from "@/tests/fixtures/leads";

const schemaKey = "custom_objects.synthetic_assessment";
const fieldIds = Object.keys(
  automationAssessmentFieldContract,
) as AutomationAssessmentFieldId[];

type TestField = {
  name: string;
  dataType: "TEXT" | "LARGE_TEXT" | "SINGLE_OPTIONS";
  fieldKey: string;
  options?: Array<{ key: string; label: string }>;
};

type TestSchemaResponse = {
  object: {
    id: string;
    key: string;
    labels: {
      singular: string;
      plural: string;
    };
    primaryDisplayProperty: string;
    searchableProperties: string[];
  };
  fields: TestField[];
  cache: boolean;
};

function propertyKey(fieldId: AutomationAssessmentFieldId) {
  return `provider_property_${fieldIds.indexOf(fieldId)}`;
}

function fullFieldKey(fieldId: AutomationAssessmentFieldId) {
  return `${schemaKey}.${propertyKey(fieldId)}`;
}

function optionKey(
  fieldId: AutomationAssessmentFieldId,
  optionIndex: number,
) {
  return `provider_option_${fieldId}_${optionIndex}`;
}

function makeSchemaResponse(): TestSchemaResponse {
  return {
    object: {
      id: "synthetic-schema-id",
      key: schemaKey,
      labels: {
        singular: "Automation Assessment",
        plural: "Automation Assessments",
      },
      primaryDisplayProperty: fullFieldKey("assessmentReference"),
      searchableProperties: [fullFieldKey("assessmentReference")],
    },
    fields: fieldIds.map((fieldId) => {
      const contract = automationAssessmentFieldContract[fieldId];
      const field: TestField = {
        name: contract.label,
        dataType: contract.dataType,
        fieldKey: fullFieldKey(fieldId),
      };

      if ("options" in contract) {
        field.options = contract.options.map((option, index) => ({
          key: optionKey(fieldId, index),
          label: option.label,
        }));
      }

      return field;
    }),
    cache: true,
  };
}

function getField(
  response: TestSchemaResponse,
  fieldId: AutomationAssessmentFieldId,
) {
  const label = automationAssessmentFieldContract[fieldId].label;
  const field = response.fields.find((candidate) => candidate.name === label);

  if (!field) {
    throw new Error(`Synthetic field fixture is missing: ${fieldId}`);
  }

  return field;
}

function expectedOptionKey(
  fieldId: AutomationAssessmentFieldId,
  websiteValue: string,
) {
  const contract = automationAssessmentFieldContract[fieldId];

  if (!("options" in contract)) {
    throw new Error(`Synthetic field fixture is not selectable: ${fieldId}`);
  }

  const optionIndex = contract.options.findIndex(
    (option) => option.value === websiteValue,
  );

  if (optionIndex === -1) {
    throw new Error(`Synthetic option fixture is missing: ${websiteValue}`);
  }

  return optionKey(fieldId, optionIndex);
}

function expectMappingError(
  callback: () => unknown,
  code: GoHighLevelAssessmentMappingErrorCode,
) {
  try {
    callback();
    throw new Error("Expected assessment mapping to fail.");
  } catch (error) {
    expect(error).toBeInstanceOf(GoHighLevelAssessmentMappingError);
    expect((error as GoHighLevelAssessmentMappingError).code).toBe(code);
    expect((error as Error).message).toBe(code);
  }
}

describe("compileAutomationAssessmentMapping", () => {
  it("compiles all exact labels, short property keys, and live option keys", () => {
    const response = makeSchemaResponse();
    const mapping = compileAutomationAssessmentMapping(response, schemaKey);

    expect(Object.keys(mapping.fields)).toHaveLength(21);
    expect(mapping).toMatchObject({
      schemaId: "synthetic-schema-id",
      schemaKey,
      primaryDisplayProperty: fullFieldKey("assessmentReference"),
      searchableProperties: [fullFieldKey("assessmentReference")],
    });
    expect(mapping.fields.assessmentReference).toMatchObject({
      propertyKey: propertyKey("assessmentReference"),
      fieldKey: fullFieldKey("assessmentReference"),
      dataType: "TEXT",
    });

    for (const fieldId of fieldIds) {
      const contract = automationAssessmentFieldContract[fieldId];

      if (!("options" in contract)) {
        continue;
      }

      for (const option of contract.options) {
        expect(mapping.fields[fieldId].optionKeys?.[option.value]).toBe(
          expectedOptionKey(fieldId, option.value),
        );
      }
    }
  });

  it("returns a redacted error for an invalid provider response", () => {
    const privateValue = "private-provider-response";

    expectMappingError(
      () =>
        compileAutomationAssessmentMapping(
          { object: { key: privateValue } },
          schemaKey,
        ),
      "assessment-schema-invalid-response",
    );

    try {
      compileAutomationAssessmentMapping(
        { object: { key: privateValue } },
        schemaKey,
      );
    } catch (error) {
      expect(JSON.stringify(error)).not.toContain(privateValue);
      expect((error as Error).stack).not.toContain(privateValue);
    }
  });

  it("requires the exact configured schema key and object labels", () => {
    const wrongKey = makeSchemaResponse();
    wrongKey.object.key = "custom_objects.other";
    expectMappingError(
      () => compileAutomationAssessmentMapping(wrongKey, schemaKey),
      "assessment-schema-key-mismatch",
    );

    const wrongLabels = makeSchemaResponse();
    wrongLabels.object.labels.singular = "Assessment";
    expectMappingError(
      () => compileAutomationAssessmentMapping(wrongLabels, schemaKey),
      "assessment-schema-object-label-mismatch",
    );
  });

  it("requires each exact field label exactly once", () => {
    const missing = makeSchemaResponse();
    missing.fields = missing.fields.filter(
      (field) =>
        field.name !==
        automationAssessmentFieldContract.monthlyLeadRange.label,
    );
    expectMappingError(
      () => compileAutomationAssessmentMapping(missing, schemaKey),
      "assessment-schema-field-missing",
    );

    const duplicate = makeSchemaResponse();
    duplicate.fields.push({
      ...getField(duplicate, "monthlyLeadRange"),
    });
    expectMappingError(
      () => compileAutomationAssessmentMapping(duplicate, schemaKey),
      "assessment-schema-field-duplicate",
    );
  });

  it("requires the exact field data type", () => {
    const response = makeSchemaResponse();
    getField(response, "assessmentReference").dataType = "LARGE_TEXT";

    expectMappingError(
      () => compileAutomationAssessmentMapping(response, schemaKey),
      "assessment-schema-field-type-mismatch",
    );
  });

  it("derives record keys only from the exact schema-key prefix", () => {
    const wrongPrefix = makeSchemaResponse();
    getField(wrongPrefix, "industry").fieldKey =
      `custom_objects.other.${propertyKey("industry")}`;
    expectMappingError(
      () => compileAutomationAssessmentMapping(wrongPrefix, schemaKey),
      "assessment-schema-field-key-invalid",
    );

    const duplicateProperty = makeSchemaResponse();
    getField(duplicateProperty, "industry").fieldKey =
      fullFieldKey("schedulingPreference");
    expectMappingError(
      () => compileAutomationAssessmentMapping(duplicateProperty, schemaKey),
      "assessment-schema-property-key-duplicate",
    );
  });

  it("requires Assessment Reference to remain the full-key primary field", () => {
    const response = makeSchemaResponse();
    response.object.primaryDisplayProperty = propertyKey(
      "assessmentReference",
    );

    expectMappingError(
      () => compileAutomationAssessmentMapping(response, schemaKey),
      "assessment-schema-primary-display-mismatch",
    );
  });

  it("does not require undocumented searchable-property metadata", () => {
    const response = makeSchemaResponse();
    delete (
      response.object as Partial<
        TestSchemaResponse["object"]
      >
    ).searchableProperties;

    expect(
      compileAutomationAssessmentMapping(response, schemaKey),
    ).toMatchObject(
      {
        searchableProperties: [],
      },
    );
  });

  it("requires each exact dropdown label once and preserves distinct option keys", () => {
    const missing = makeSchemaResponse();
    const missingOptions = getField(missing, "monthlyLeadRange").options ?? [];
    missingOptions.shift();
    expectMappingError(
      () => compileAutomationAssessmentMapping(missing, schemaKey),
      "assessment-schema-option-missing",
    );

    const duplicateLabel = makeSchemaResponse();
    const duplicateLabelOptions =
      getField(duplicateLabel, "monthlyLeadRange").options ?? [];
    duplicateLabelOptions.push({
      ...duplicateLabelOptions[0],
      key: "another-live-key",
    });
    expectMappingError(
      () => compileAutomationAssessmentMapping(duplicateLabel, schemaKey),
      "assessment-schema-option-duplicate",
    );

    const duplicateKey = makeSchemaResponse();
    const duplicateKeyOptions =
      getField(duplicateKey, "monthlyLeadRange").options ?? [];
    duplicateKeyOptions[1].key = duplicateKeyOptions[0].key;
    expectMappingError(
      () => compileAutomationAssessmentMapping(duplicateKey, schemaKey),
      "assessment-schema-option-key-duplicate",
    );
  });
});

describe("buildAutomationAssessmentProperties", () => {
  it("maps every website dropdown value to its verified stored option key", () => {
    const mapping = compileAutomationAssessmentMapping(
      makeSchemaResponse(),
      schemaKey,
    );

    for (const fieldId of fieldIds) {
      const contract = automationAssessmentFieldContract[fieldId];

      if (!("options" in contract)) {
        continue;
      }

      for (const option of contract.options) {
        const websiteValue = [
          "contactConsent",
          "privacyTermsConsent",
          "smsConsent",
        ].includes(fieldId)
          ? option.value === "true"
          : option.value;
        const assessment = {
          ...makeAssessmentSubmission({
            incomingCallOwnerOther: "Other call owner",
            biggestChallengeOther: "Other challenge",
          }),
          [fieldId]: websiteValue,
        } as AutomationAssessment;
        const properties = buildAutomationAssessmentProperties({
          assessment,
          assessmentReference: "TA-all-options",
          mapping,
        });

        expect(properties[propertyKey(fieldId)]).toBe(
          expectedOptionKey(fieldId, option.value),
        );
      }
    }
  });

  it("maps a complete assessment to verified keys and stored option values", () => {
    const mapping = compileAutomationAssessmentMapping(
      makeSchemaResponse(),
      schemaKey,
    );
    const assessment = makeAssessmentSubmission({
      schedulingPreference: "Weekday afternoons",
      customerValueRange: "1000-to-5000",
      websiteInquiryProcess: "manual-contact",
      incomingCallOwner: "other",
      incomingCallOwnerOther: "Service desk",
      quoteFollowUpProcess: "automatic-reminders",
      pipelineVisibility: "one-system",
      leadTrackingMethod: "crm",
      biggestChallenge: "other",
      biggestChallengeOther: "Disconnected tools",
      assessmentFollowUpPreference: "information-first",
      additionalNotes: "First line\nSecond line",
      smsConsent: true,
      landingPage: "https://tergion.com/private-attribution",
      triggerSource: "private-trigger",
      timezone: "America/Los_Angeles",
    });
    const properties = buildAutomationAssessmentProperties({
      assessment,
      assessmentReference: "TA-synthetic-lead",
      mapping,
    });

    expect(Object.keys(properties)).toHaveLength(21);
    expect(properties[propertyKey("assessmentReference")]).toBe(
      "TA-synthetic-lead",
    );
    expect(properties[propertyKey("preferredContactMethod")]).toBe(
      expectedOptionKey("preferredContactMethod", "email"),
    );
    expect(properties[propertyKey("customerValueRange")]).toBe(
      expectedOptionKey("customerValueRange", "1000-to-5000"),
    );
    expect(properties[propertyKey("incomingCallOwner")]).toBe(
      expectedOptionKey("incomingCallOwner", "other"),
    );
    expect(properties[propertyKey("incomingCallOwnerOther")]).toBe(
      "Service desk",
    );
    expect(properties[propertyKey("biggestChallengeOther")]).toBe(
      "Disconnected tools",
    );
    expect(properties[propertyKey("contactConsent")]).toBe(
      expectedOptionKey("contactConsent", "true"),
    );
    expect(properties[propertyKey("privacyTermsConsent")]).toBe(
      expectedOptionKey("privacyTermsConsent", "true"),
    );
    expect(properties[propertyKey("smsConsent")]).toBe(
      expectedOptionKey("smsConsent", "true"),
    );
    expect(properties[propertyKey("additionalNotes")]).toBe(
      "First line\nSecond line",
    );
    expect(JSON.stringify(properties)).not.toContain(assessment.email);
    expect(JSON.stringify(properties)).not.toContain(assessment.businessName);
    expect(JSON.stringify(properties)).not.toContain(
      "private-attribution",
    );
    expect(JSON.stringify(properties)).not.toContain("private-trigger");
    expect(JSON.stringify(properties)).not.toContain(
      "America/Los_Angeles",
    );
  });

  it("omits absent optional fields and stale conditional Other values", () => {
    const mapping = compileAutomationAssessmentMapping(
      makeSchemaResponse(),
      schemaKey,
    );
    const assessment = makeAssessmentSubmission({
      schedulingPreference: undefined,
      customerValueRange: undefined,
      websiteInquiryProcess: undefined,
      incomingCallOwner: "owner",
      incomingCallOwnerOther: "Stale call owner",
      quoteFollowUpProcess: undefined,
      pipelineVisibility: undefined,
      leadTrackingMethod: undefined,
      biggestChallenge: "faster-follow-up",
      biggestChallengeOther: "Stale challenge",
      additionalNotes: undefined,
      smsConsent: false,
    });
    const properties = buildAutomationAssessmentProperties({
      assessment,
      assessmentReference: "TA-minimal",
      mapping,
    });

    for (const fieldId of [
      "schedulingPreference",
      "customerValueRange",
      "websiteInquiryProcess",
      "incomingCallOwnerOther",
      "quoteFollowUpProcess",
      "pipelineVisibility",
      "leadTrackingMethod",
      "biggestChallengeOther",
      "additionalNotes",
    ] as const) {
      expect(properties).not.toHaveProperty(propertyKey(fieldId));
    }

    expect(properties[propertyKey("smsConsent")]).toBe(
      expectedOptionKey("smsConsent", "false"),
    );
  });

  it("sanitizes single-line text and preserves intentional multiline content", () => {
    const mapping = compileAutomationAssessmentMapping(
      makeSchemaResponse(),
      schemaKey,
    );
    const properties = buildAutomationAssessmentProperties({
      assessment: makeAssessmentSubmission({
        schedulingPreference:
          "  Monday\r\n\t<script>alert(1)</script>\u0000 after 5  ",
        industry:
          "<strong>Professional</strong>\u0007 services",
        additionalNotes:
          " First\r\nSecond\u0000\n\n<strong>Third</strong> ",
      }),
      assessmentReference: "  TA-clean\r\nreference  ",
      mapping,
    });

    expect(properties[propertyKey("assessmentReference")]).toBe(
      "TA-clean reference",
    );
    expect(properties[propertyKey("schedulingPreference")]).toBe(
      "Monday alert(1) after 5",
    );
    expect(properties[propertyKey("industry")]).toBe(
      "Professional services",
    );
    expect(properties[propertyKey("additionalNotes")]).toBe(
      "First\nSecond\n\nThird",
    );
    expect(JSON.stringify(properties)).not.toMatch(/[<>\u0000\u0007]/);
  });

  it("omits optional text sanitized to empty and rejects empty required text", () => {
    const mapping = compileAutomationAssessmentMapping(
      makeSchemaResponse(),
      schemaKey,
    );
    const optionalEmpty = buildAutomationAssessmentProperties({
      assessment: makeAssessmentSubmission({
        schedulingPreference: "<script></script>\u0000",
      }),
      assessmentReference: "TA-optional-empty",
      mapping,
    });

    expect(optionalEmpty).not.toHaveProperty(
      propertyKey("schedulingPreference"),
    );

    expectMappingError(
      () =>
        buildAutomationAssessmentProperties({
          assessment: makeAssessmentSubmission({
            industry: "<script></script>\u0000",
          }),
          assessmentReference: "TA-required-empty",
          mapping,
        }),
      "assessment-mapping-required-value-missing",
    );
  });

  it("requires conditional Other text when the controlling value is Other", () => {
    const mapping = compileAutomationAssessmentMapping(
      makeSchemaResponse(),
      schemaKey,
    );

    expectMappingError(
      () =>
        buildAutomationAssessmentProperties({
          assessment: makeAssessmentSubmission({
            incomingCallOwner: "other",
            incomingCallOwnerOther: undefined,
          }),
          assessmentReference: "TA-other-empty",
          mapping,
        }),
      "assessment-mapping-required-value-missing",
    );
  });

  it("fails closed for an unknown website enum value", () => {
    const mapping = compileAutomationAssessmentMapping(
      makeSchemaResponse(),
      schemaKey,
    );
    const assessment = {
      ...makeAssessmentSubmission(),
      preferredContactMethod: "fax",
    } as unknown as AutomationAssessment;

    expectMappingError(
      () =>
        buildAutomationAssessmentProperties({
          assessment,
          assessmentReference: "TA-invalid-enum",
          mapping,
        }),
      "assessment-mapping-option-unknown",
    );
  });
});
