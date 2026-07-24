import { z } from "zod";

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

const supportedAssessmentDataTypes = [
  "TEXT",
  "LARGE_TEXT",
  "SINGLE_OPTIONS",
] as const;

const goHighLevelOptionSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
  })
  .passthrough();

const goHighLevelFieldSchema = z
  .object({
    name: z.string().min(1),
    dataType: z.enum(supportedAssessmentDataTypes),
    fieldKey: z.string().min(1),
    options: z.array(goHighLevelOptionSchema).optional(),
  })
  .passthrough();

const goHighLevelAssessmentSchemaResponseSchema = z
  .object({
    object: z
      .object({
        id: z.string().min(1),
        key: z.string().min(1),
        labels: z
          .object({
            singular: z.string().min(1),
            plural: z.string().min(1),
          })
          .passthrough(),
        primaryDisplayProperty: z.string().min(1),
        searchableProperties: z
          .array(z.string().min(1))
          .optional()
          .default([]),
      })
      .passthrough(),
    fields: z.array(goHighLevelFieldSchema),
    cache: z.boolean(),
  })
  .passthrough();

export type GoHighLevelAssessmentSchemaResponse = z.infer<
  typeof goHighLevelAssessmentSchemaResponseSchema
>;

type AssessmentDataType =
  (typeof supportedAssessmentDataTypes)[number];

type OptionContract = Readonly<{
  value: string;
  label: string;
}>;

type AssessmentFieldContract =
  | Readonly<{
      label: string;
      dataType: "TEXT" | "LARGE_TEXT";
    }>
  | Readonly<{
      label: string;
      dataType: "SINGLE_OPTIONS";
      options: readonly OptionContract[];
    }>;

const yesNoOptions = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
] as const;

export const automationAssessmentFieldContract = {
  assessmentReference: {
    label: "Assessment Reference",
    dataType: "TEXT",
  },
  preferredContactMethod: {
    label: "Preferred Contact Method",
    dataType: "SINGLE_OPTIONS",
    options: assessmentPreferredContactMethods,
  },
  schedulingPreference: {
    label: "Scheduling Preference",
    dataType: "TEXT",
  },
  industry: {
    label: "Industry",
    dataType: "TEXT",
  },
  monthlyLeadRange: {
    label: "Monthly Lead Range",
    dataType: "SINGLE_OPTIONS",
    options: monthlyLeadRangeOptions,
  },
  customerValueRange: {
    label: "Average Customer Value",
    dataType: "SINGLE_OPTIONS",
    options: customerValueRangeOptions,
  },
  websiteInquiryProcess: {
    label: "Website Inquiry Process",
    dataType: "SINGLE_OPTIONS",
    options: websiteInquiryProcessOptions,
  },
  incomingCallOwner: {
    label: "Incoming Call Owner",
    dataType: "SINGLE_OPTIONS",
    options: incomingCallOwnerOptions,
  },
  incomingCallOwnerOther: {
    label: "Incoming Call Owner Other",
    dataType: "TEXT",
  },
  missedCallProcess: {
    label: "Missed Call Process",
    dataType: "SINGLE_OPTIONS",
    options: missedCallProcessOptions,
  },
  leadResponseTime: {
    label: "Lead Response Time",
    dataType: "SINGLE_OPTIONS",
    options: leadResponseTimeOptions,
  },
  quoteFollowUpProcess: {
    label: "Quote Follow-Up Process",
    dataType: "SINGLE_OPTIONS",
    options: quoteFollowUpProcessOptions,
  },
  pipelineVisibility: {
    label: "Pipeline Visibility",
    dataType: "SINGLE_OPTIONS",
    options: pipelineVisibilityOptions,
  },
  leadTrackingMethod: {
    label: "Lead Tracking Method",
    dataType: "SINGLE_OPTIONS",
    options: leadTrackingMethodOptions,
  },
  biggestChallenge: {
    label: "Biggest Challenge",
    dataType: "SINGLE_OPTIONS",
    options: biggestChallengeOptions,
  },
  biggestChallengeOther: {
    label: "Biggest Challenge Other",
    dataType: "TEXT",
  },
  assessmentFollowUpPreference: {
    label: "Assessment Follow-Up Preference",
    dataType: "SINGLE_OPTIONS",
    options: assessmentFollowUpPreferenceOptions,
  },
  additionalNotes: {
    label: "Additional Notes",
    dataType: "LARGE_TEXT",
  },
  contactConsent: {
    label: "Contact Consent",
    dataType: "SINGLE_OPTIONS",
    options: yesNoOptions,
  },
  privacyTermsConsent: {
    label: "Privacy and Terms Consent",
    dataType: "SINGLE_OPTIONS",
    options: yesNoOptions,
  },
  smsConsent: {
    label: "SMS Consent",
    dataType: "SINGLE_OPTIONS",
    options: yesNoOptions,
  },
} as const satisfies Record<string, AssessmentFieldContract>;

export type AutomationAssessmentFieldId =
  keyof typeof automationAssessmentFieldContract;

type CompiledAssessmentField = Readonly<{
  propertyKey: string;
  fieldKey: string;
  dataType: AssessmentDataType;
  optionKeys?: Readonly<Record<string, string>>;
}>;

export type CompiledAutomationAssessmentMapping = Readonly<{
  schemaId: string;
  schemaKey: string;
  primaryDisplayProperty: string;
  searchableProperties: readonly string[];
  fields: Readonly<
    Record<AutomationAssessmentFieldId, CompiledAssessmentField>
  >;
}>;

export const goHighLevelAssessmentMappingErrorCodes = [
  "assessment-schema-invalid-response",
  "assessment-schema-key-mismatch",
  "assessment-schema-object-label-mismatch",
  "assessment-schema-field-missing",
  "assessment-schema-field-duplicate",
  "assessment-schema-field-type-mismatch",
  "assessment-schema-field-key-invalid",
  "assessment-schema-property-key-duplicate",
  "assessment-schema-primary-display-mismatch",
  "assessment-schema-option-missing",
  "assessment-schema-option-duplicate",
  "assessment-schema-option-key-duplicate",
  "assessment-mapping-invalid",
  "assessment-mapping-required-value-missing",
  "assessment-mapping-option-unknown",
] as const;

export type GoHighLevelAssessmentMappingErrorCode =
  (typeof goHighLevelAssessmentMappingErrorCodes)[number];

export class GoHighLevelAssessmentMappingError extends Error {
  readonly code: GoHighLevelAssessmentMappingErrorCode;

  constructor(code: GoHighLevelAssessmentMappingErrorCode) {
    super(code);
    this.name = "GoHighLevelAssessmentMappingError";
    this.code = code;
  }
}

function fail(code: GoHighLevelAssessmentMappingErrorCode): never {
  throw new GoHighLevelAssessmentMappingError(code);
}

export function parseGoHighLevelAssessmentSchemaResponse(
  input: unknown,
): GoHighLevelAssessmentSchemaResponse {
  const parsed = goHighLevelAssessmentSchemaResponseSchema.safeParse(input);

  if (!parsed.success) {
    fail("assessment-schema-invalid-response");
  }

  return parsed.data;
}

function getShortPropertyKey(fieldKey: string, schemaKey: string) {
  const prefix = `${schemaKey}.`;

  if (!fieldKey.startsWith(prefix)) {
    fail("assessment-schema-field-key-invalid");
  }

  const propertyKey = fieldKey.slice(prefix.length);

  if (!propertyKey) {
    fail("assessment-schema-field-key-invalid");
  }

  return propertyKey;
}

function compileOptionKeys(
  field: GoHighLevelAssessmentSchemaResponse["fields"][number],
  contract: Extract<
    AssessmentFieldContract,
    { dataType: "SINGLE_OPTIONS" }
  >,
) {
  const optionKeys = Object.create(null) as Record<string, string>;
  const usedKeys = new Set<string>();

  for (const expectedOption of contract.options) {
    const matches =
      field.options?.filter(
        (liveOption) => liveOption.label === expectedOption.label,
      ) ?? [];

    if (!matches.length) {
      fail("assessment-schema-option-missing");
    }

    if (matches.length !== 1) {
      fail("assessment-schema-option-duplicate");
    }

    const optionKey = matches[0].key;

    if (usedKeys.has(optionKey)) {
      fail("assessment-schema-option-key-duplicate");
    }

    usedKeys.add(optionKey);
    optionKeys[expectedOption.value] = optionKey;
  }

  return Object.freeze(optionKeys);
}

export function compileAutomationAssessmentMapping(
  input: unknown,
  expectedSchemaKey: string,
): CompiledAutomationAssessmentMapping {
  const response = parseGoHighLevelAssessmentSchemaResponse(input);

  if (response.object.key !== expectedSchemaKey) {
    fail("assessment-schema-key-mismatch");
  }

  if (
    response.object.labels.singular !== "Automation Assessment" ||
    response.object.labels.plural !== "Automation Assessments"
  ) {
    fail("assessment-schema-object-label-mismatch");
  }

  const compiledFields = Object.create(null) as Partial<
    Record<AutomationAssessmentFieldId, CompiledAssessmentField>
  >;
  const usedPropertyKeys = new Set<string>();

  for (const [fieldId, contract] of Object.entries(
    automationAssessmentFieldContract,
  ) as Array<
    [AutomationAssessmentFieldId, AssessmentFieldContract]
  >) {
    const matches = response.fields.filter(
      (field) => field.name === contract.label,
    );

    if (!matches.length) {
      fail("assessment-schema-field-missing");
    }

    if (matches.length !== 1) {
      fail("assessment-schema-field-duplicate");
    }

    const field = matches[0];

    if (field.dataType !== contract.dataType) {
      fail("assessment-schema-field-type-mismatch");
    }

    const propertyKey = getShortPropertyKey(
      field.fieldKey,
      response.object.key,
    );

    if (usedPropertyKeys.has(propertyKey)) {
      fail("assessment-schema-property-key-duplicate");
    }

    usedPropertyKeys.add(propertyKey);
    compiledFields[fieldId] = Object.freeze({
      propertyKey,
      fieldKey: field.fieldKey,
      dataType: field.dataType,
      optionKeys:
        contract.dataType === "SINGLE_OPTIONS"
          ? compileOptionKeys(
              field,
              contract as Extract<
                AssessmentFieldContract,
                { dataType: "SINGLE_OPTIONS" }
              >,
            )
          : undefined,
    });
  }

  const fields = compiledFields as Record<
    AutomationAssessmentFieldId,
    CompiledAssessmentField
  >;

  // The v3 schema response does not expose field uniqueness. Discovery must
  // verify that setting separately; this parser only verifies the primary field.
  if (
    response.object.primaryDisplayProperty !==
    fields.assessmentReference.fieldKey
  ) {
    fail("assessment-schema-primary-display-mismatch");
  }

  return Object.freeze({
    schemaId: response.object.id,
    schemaKey: response.object.key,
    primaryDisplayProperty: response.object.primaryDisplayProperty,
    searchableProperties: Object.freeze([
      ...response.object.searchableProperties,
    ]),
    fields: Object.freeze(fields),
  });
}

const disallowedControlCharacters =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const htmlTagPattern = /<[^>]*>/g;

function sanitizeBaseText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\r\n|\r|\u2028|\u2029/g, "\n")
    .replace(disallowedControlCharacters, " ")
    .replace(htmlTagPattern, " ")
    .replace(/[<>]/g, " ");
}

function sanitizeSingleLine(value: unknown) {
  return sanitizeBaseText(value).replace(/\s+/g, " ").trim();
}

function sanitizeMultiline(value: unknown) {
  return sanitizeBaseText(value)
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .join("\n")
    .trim();
}

function hasOwn(record: Readonly<Record<string, string>>, key: string) {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function resolveOptionKey(
  mapping: CompiledAutomationAssessmentMapping,
  fieldId: AutomationAssessmentFieldId,
  value: unknown,
) {
  const optionKeys = mapping.fields[fieldId]?.optionKeys;

  if (
    !optionKeys ||
    typeof value !== "string" ||
    !hasOwn(optionKeys, value)
  ) {
    fail("assessment-mapping-option-unknown");
  }

  return optionKeys[value];
}

export type BuildAutomationAssessmentPropertiesInput = Readonly<{
  assessment: AutomationAssessment;
  assessmentReference: string;
  mapping: CompiledAutomationAssessmentMapping;
}>;

export type GoHighLevelAssessmentProperties = Readonly<
  Record<string, string>
>;

export function buildAutomationAssessmentProperties({
  assessment,
  assessmentReference,
  mapping,
}: BuildAutomationAssessmentPropertiesInput): GoHighLevelAssessmentProperties {
  if (
    assessment.submissionType !== "automation_assessment" ||
    !mapping.fields
  ) {
    fail("assessment-mapping-invalid");
  }

  const properties = Object.create(null) as Record<string, string>;

  function assign(
    fieldId: AutomationAssessmentFieldId,
    value: string,
  ) {
    const propertyKey = mapping.fields[fieldId]?.propertyKey;

    if (!propertyKey) {
      fail("assessment-mapping-invalid");
    }

    properties[propertyKey] = value;
  }

  function assignRequiredText(
    fieldId: AutomationAssessmentFieldId,
    value: unknown,
    multiline = false,
  ) {
    const sanitized = multiline
      ? sanitizeMultiline(value)
      : sanitizeSingleLine(value);

    if (!sanitized) {
      fail("assessment-mapping-required-value-missing");
    }

    assign(fieldId, sanitized);
  }

  function assignOptionalText(
    fieldId: AutomationAssessmentFieldId,
    value: unknown,
    multiline = false,
  ) {
    const sanitized = multiline
      ? sanitizeMultiline(value)
      : sanitizeSingleLine(value);

    if (sanitized) {
      assign(fieldId, sanitized);
    }
  }

  function assignRequiredOption(
    fieldId: AutomationAssessmentFieldId,
    value: unknown,
  ) {
    assign(fieldId, resolveOptionKey(mapping, fieldId, value));
  }

  function assignOptionalOption(
    fieldId: AutomationAssessmentFieldId,
    value: unknown,
  ) {
    if (value === undefined || value === "") {
      return;
    }

    assignRequiredOption(fieldId, value);
  }

  function assignBooleanOption(
    fieldId: AutomationAssessmentFieldId,
    value: unknown,
  ) {
    if (typeof value !== "boolean") {
      fail("assessment-mapping-invalid");
    }

    assignRequiredOption(fieldId, value ? "true" : "false");
  }

  assignRequiredText("assessmentReference", assessmentReference);
  assignRequiredOption(
    "preferredContactMethod",
    assessment.preferredContactMethod,
  );
  assignOptionalText(
    "schedulingPreference",
    assessment.schedulingPreference,
  );
  assignRequiredText("industry", assessment.industry);
  assignRequiredOption("monthlyLeadRange", assessment.monthlyLeadRange);
  assignOptionalOption(
    "customerValueRange",
    assessment.customerValueRange,
  );
  assignOptionalOption(
    "websiteInquiryProcess",
    assessment.websiteInquiryProcess,
  );
  assignRequiredOption(
    "incomingCallOwner",
    assessment.incomingCallOwner,
  );

  if (assessment.incomingCallOwner === "other") {
    assignRequiredText(
      "incomingCallOwnerOther",
      assessment.incomingCallOwnerOther,
    );
  }

  assignRequiredOption("missedCallProcess", assessment.missedCallProcess);
  assignRequiredOption("leadResponseTime", assessment.leadResponseTime);
  assignOptionalOption(
    "quoteFollowUpProcess",
    assessment.quoteFollowUpProcess,
  );
  assignOptionalOption(
    "pipelineVisibility",
    assessment.pipelineVisibility,
  );
  assignOptionalOption(
    "leadTrackingMethod",
    assessment.leadTrackingMethod,
  );
  assignRequiredOption("biggestChallenge", assessment.biggestChallenge);

  if (assessment.biggestChallenge === "other") {
    assignRequiredText(
      "biggestChallengeOther",
      assessment.biggestChallengeOther,
    );
  }

  assignRequiredOption(
    "assessmentFollowUpPreference",
    assessment.assessmentFollowUpPreference,
  );
  assignOptionalText(
    "additionalNotes",
    assessment.additionalNotes,
    true,
  );
  assignBooleanOption("contactConsent", assessment.contactConsent);
  assignBooleanOption(
    "privacyTermsConsent",
    assessment.privacyTermsConsent,
  );
  assignBooleanOption("smsConsent", assessment.smsConsent ?? false);

  return Object.freeze(properties);
}
