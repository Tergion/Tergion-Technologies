import { z } from "zod";

import {
  buildAutomationAssessmentProperties,
  compileAutomationAssessmentMapping,
  type CompiledAutomationAssessmentMapping,
  type GoHighLevelAssessmentProperties,
} from "@/features/leads/gohighlevel-assessment-mapping";
import {
  requestGoHighLevel,
} from "@/features/leads/gohighlevel-client";
import type {
  AutomationAssessmentRecord,
} from "@/features/leads/lead.types";
import { env } from "@/lib/env";

const contactObjectKey = "contact";
const assessmentObjectLabel = "Automation Assessments";
const contactAssociationLabel = "Submitted By";
const searchPageLimit = 20;
const assessmentConfigurationCacheTtlMs = 15 * 60 * 1_000;

const associationSchema = z
  .object({
    locationId: z.string().min(1),
    id: z.string().min(1),
    key: z.string().min(1),
    firstObjectLabel: z.string().min(1),
    firstObjectKey: z.string().min(1),
    secondObjectLabel: z.string().min(1),
    secondObjectKey: z.string().min(1),
    associationType: z.enum(["USER_DEFINED", "SYSTEM_DEFINED"]),
  })
  .passthrough();

const assessmentRecordSchema = z
  .object({
    id: z.string().min(1),
    properties: z.record(z.string(), z.unknown()),
  })
  .passthrough();

const assessmentSearchResponseSchema = z
  .object({
    records: z.array(assessmentRecordSchema).optional().default([]),
    total: z.number().int().nonnegative(),
  })
  .passthrough();

const assessmentCreateResponseSchema = z
  .object({
    record: z
      .object({
        id: z.string().min(1),
      })
      .passthrough(),
  })
  .passthrough();

const relationAssociationSchema = z
  .object({
    associationId: z.string().min(1),
    relationId: z.string().min(1),
  })
  .passthrough();

const relatedRecordSchema = z
  .object({
    recordId: z.string().min(1),
    associations: z.array(relationAssociationSchema),
  })
  .passthrough();

const relationsResponseSchema = z
  .object({
    relations: z.array(relatedRecordSchema),
  })
  .passthrough();

const relationCreateResponseSchema = z
  .object({
    id: z.string().min(1),
    firstObjectKey: z.string().min(1),
    firstRecordId: z.string().min(1),
    secondObjectKey: z.string().min(1),
    secondRecordId: z.string().min(1),
    associationId: z.string().min(1),
    locationId: z.string().min(1),
  })
  .passthrough();

type AssessmentAssociation = z.infer<typeof associationSchema>;

type AssessmentConfiguration = Readonly<{
  mapping: CompiledAutomationAssessmentMapping;
  association: AssessmentAssociation;
}>;

export type PreparedAutomationAssessment = Readonly<{
  assessmentReference: string;
  configuration: AssessmentConfiguration;
  properties: GoHighLevelAssessmentProperties;
  existingRecordId?: string;
}>;

export type PersistedAutomationAssessment = Readonly<{
  assessmentReference: string;
  recordId: string;
  created: boolean;
}>;

export const assessmentPersistenceErrorCodes = [
  "assessment-configuration-key-invalid",
  "assessment-association-invalid-response",
  "assessment-association-mismatch",
  "assessment-record-search-invalid-response",
  "assessment-record-search-incomplete",
  "assessment-record-reference-duplicate",
  "assessment-record-reference-conflict",
  "assessment-record-create-invalid-response",
  "assessment-relation-invalid-response",
  "assessment-relation-conflict",
  "assessment-relation-create-invalid-response",
] as const;

type AssessmentPersistenceErrorCode =
  (typeof assessmentPersistenceErrorCodes)[number];

export class GoHighLevelAssessmentPersistenceError extends Error {
  readonly code: AssessmentPersistenceErrorCode;

  constructor(code: AssessmentPersistenceErrorCode) {
    super(code);
    this.name = "GoHighLevelAssessmentPersistenceError";
    this.code = code;
  }
}

function fail(code: AssessmentPersistenceErrorCode): never {
  throw new GoHighLevelAssessmentPersistenceError(code);
}

function parseOrFail<T>(
  schema: z.ZodType<T>,
  value: unknown,
  code: AssessmentPersistenceErrorCode,
) {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    fail(code);
  }

  return parsed.data;
}

function validateConfigurationKeys() {
  const schemaKey = env.goHighLevelAssessmentObjectSchemaKey.trim();
  const associationKey =
    env.goHighLevelAssessmentContactAssociationKey.trim();

  if (
    !/^custom_objects\.[a-z0-9_]+$/.test(schemaKey) ||
    !/^[a-z0-9_]+$/.test(associationKey)
  ) {
    fail("assessment-configuration-key-invalid");
  }

  return { associationKey, schemaKey };
}

function validateAssociation(
  value: unknown,
  schemaKey: string,
  associationKey: string,
) {
  const association = parseOrFail(
    associationSchema,
    value,
    "assessment-association-invalid-response",
  );
  const hasExpectedObjects =
    (association.firstObjectKey === schemaKey &&
      association.secondObjectKey === contactObjectKey) ||
    (association.firstObjectKey === contactObjectKey &&
      association.secondObjectKey === schemaKey);
  const hasExpectedLabels =
    association.firstObjectKey === schemaKey
      ? association.firstObjectLabel === assessmentObjectLabel &&
        association.secondObjectLabel === contactAssociationLabel
      : association.firstObjectLabel === contactAssociationLabel &&
        association.secondObjectLabel === assessmentObjectLabel;

  if (
    association.locationId !== env.goHighLevelLocationId ||
    association.key !== associationKey ||
    association.associationType !== "USER_DEFINED" ||
    !hasExpectedObjects ||
    !hasExpectedLabels
  ) {
    fail("assessment-association-mismatch");
  }

  return association;
}

async function discoverAssessmentConfiguration(
  leadId: string,
): Promise<AssessmentConfiguration> {
  const { associationKey, schemaKey } = validateConfigurationKeys();
  const locationId = encodeURIComponent(env.goHighLevelLocationId);
  const [schemaResponse, associationResponse] = await Promise.all([
    requestGoHighLevel({
      method: "GET",
      path:
        `/objects/${encodeURIComponent(schemaKey)}` +
        `?locationId=${locationId}&fetchProperties=true`,
      version: "v3",
      stage: "discover-assessment-schema",
      leadId,
      expectedStatuses: [200],
      parseJson: true,
      retrySafeRead: true,
    }),
    requestGoHighLevel({
      method: "GET",
      path:
        `/associations/key/${encodeURIComponent(associationKey)}` +
        `?locationId=${locationId}`,
      version: "v3",
      stage: "discover-assessment-association",
      leadId,
      expectedStatuses: [200],
      parseJson: true,
      retrySafeRead: true,
    }),
  ]);

  return Object.freeze({
    mapping: compileAutomationAssessmentMapping(
      schemaResponse,
      schemaKey,
    ),
    association: validateAssociation(
      associationResponse,
      schemaKey,
      associationKey,
    ),
  });
}

let assessmentConfigurationPromise:
  | Promise<AssessmentConfiguration>
  | undefined;
let assessmentConfigurationExpiresAt = 0;

function getAssessmentConfiguration(leadId: string) {
  if (
    !assessmentConfigurationPromise ||
    Date.now() >= assessmentConfigurationExpiresAt
  ) {
    assessmentConfigurationExpiresAt =
      Date.now() + assessmentConfigurationCacheTtlMs;
    assessmentConfigurationPromise =
      discoverAssessmentConfiguration(leadId).catch((error) => {
        assessmentConfigurationPromise = undefined;
        assessmentConfigurationExpiresAt = 0;
        throw error;
      });
  }

  return assessmentConfigurationPromise;
}

function ensureAssessmentReference(leadId: string) {
  const assessmentReference = `TA-${leadId}`;

  if (!/^TA-[A-Za-z0-9-]{1,100}$/.test(assessmentReference)) {
    fail("assessment-record-reference-conflict");
  }

  return assessmentReference;
}

function verifyExistingProperties(
  existingProperties: Record<string, unknown>,
  desiredProperties: GoHighLevelAssessmentProperties,
) {
  for (const [propertyKey, desiredValue] of Object.entries(
    desiredProperties,
  )) {
    if (existingProperties[propertyKey] !== desiredValue) {
      fail("assessment-record-reference-conflict");
    }
  }
}

async function findAssessmentRecord(
  configuration: AssessmentConfiguration,
  assessmentReference: string,
  properties: GoHighLevelAssessmentProperties,
  leadId: string,
) {
  const referencePropertyKey =
    configuration.mapping.fields.assessmentReference.propertyKey;
  const response = await requestGoHighLevel({
    method: "POST",
    path:
      `/objects/${encodeURIComponent(configuration.mapping.schemaKey)}` +
      "/records/search",
    version: "v3",
    stage: "search-assessment-record",
    leadId,
    body: {
      locationId: env.goHighLevelLocationId,
      page: 1,
      pageLimit: searchPageLimit,
      query: assessmentReference,
      filters: [
        {
          group: "AND",
          filters: [
            {
              field: `properties.${referencePropertyKey}`,
              operator: "eq",
              value: assessmentReference,
            },
          ],
        },
      ],
      searchAfter: [],
    },
    expectedStatuses: [200],
    parseJson: true,
    retrySafeRead: true,
  });
  const searchResult = parseOrFail(
    assessmentSearchResponseSchema,
    response,
    "assessment-record-search-invalid-response",
  );

  if (searchResult.total > searchResult.records.length) {
    fail("assessment-record-search-incomplete");
  }

  const exactMatches = searchResult.records.filter(
    (record) =>
      record.properties[referencePropertyKey] === assessmentReference,
  );

  if (exactMatches.length > 1) {
    fail("assessment-record-reference-duplicate");
  }

  const existingRecord = exactMatches[0];

  if (!existingRecord) {
    return undefined;
  }

  verifyExistingProperties(existingRecord.properties, properties);
  return existingRecord.id;
}

export async function prepareAutomationAssessment(
  assessment: AutomationAssessmentRecord,
): Promise<PreparedAutomationAssessment> {
  const assessmentReference = ensureAssessmentReference(assessment.leadId);
  const configuration = await getAssessmentConfiguration(
    assessment.leadId,
  );
  const properties = buildAutomationAssessmentProperties({
    assessment,
    assessmentReference,
    mapping: configuration.mapping,
  });
  const existingRecordId = await findAssessmentRecord(
    configuration,
    assessmentReference,
    properties,
    assessment.leadId,
  );

  return Object.freeze({
    assessmentReference,
    configuration,
    properties,
    existingRecordId,
  });
}

async function createAssessmentRecord(
  prepared: PreparedAutomationAssessment,
  leadId: string,
) {
  const response = await requestGoHighLevel({
    method: "POST",
    path:
      `/objects/${encodeURIComponent(
        prepared.configuration.mapping.schemaKey,
      )}/records`,
    version: "v3",
    stage: "create-assessment-record",
    leadId,
    body: {
      locationId: env.goHighLevelLocationId,
      properties: prepared.properties,
    },
    expectedStatuses: [201],
    parseJson: true,
  });
  const result = parseOrFail(
    assessmentCreateResponseSchema,
    response,
    "assessment-record-create-invalid-response",
  );

  return result.record.id;
}

async function createOrRecoverAssessmentRecord(
  prepared: PreparedAutomationAssessment,
  leadId: string,
) {
  if (prepared.existingRecordId) {
    return {
      created: false,
      recordId: prepared.existingRecordId,
    };
  }

  try {
    return {
      created: true,
      recordId: await createAssessmentRecord(prepared, leadId),
    };
  } catch (createError) {
    const recoveredRecordId = await findAssessmentRecord(
      prepared.configuration,
      prepared.assessmentReference,
      prepared.properties,
      leadId,
    );

    if (recoveredRecordId) {
      return {
        created: false,
        recordId: recoveredRecordId,
      };
    }

    throw createError;
  }
}

function relationPath(recordId: string, associationId: string) {
  return (
    `/associations/relations/${encodeURIComponent(recordId)}` +
    `?locationId=${encodeURIComponent(env.goHighLevelLocationId)}` +
    "&skip=0&limit=100" +
    `&associationIds=${encodeURIComponent(associationId)}`
  );
}

async function findAssessmentContactRelation(
  recordId: string,
  contactId: string,
  associationId: string,
  leadId: string,
) {
  const response = await requestGoHighLevel({
    method: "GET",
    path: relationPath(recordId, associationId),
    version: "v3",
    stage: "get-assessment-relations",
    leadId,
    expectedStatuses: [200],
    parseJson: true,
    retrySafeRead: true,
  });
  const relationResult = parseOrFail(
    relationsResponseSchema,
    response,
    "assessment-relation-invalid-response",
  );
  const associatedRecordIds = new Set(
    relationResult.relations
      .filter((relatedRecord) =>
        relatedRecord.associations.some(
          (association) =>
            association.associationId === associationId,
        ),
      )
      .map((relatedRecord) => relatedRecord.recordId),
  );

  if (
    associatedRecordIds.size > 1 ||
    (associatedRecordIds.size === 1 &&
      !associatedRecordIds.has(contactId))
  ) {
    fail("assessment-relation-conflict");
  }

  return associatedRecordIds.has(contactId);
}

function getOrientedRelationBody(
  association: AssessmentAssociation,
  schemaKey: string,
  recordId: string,
  contactId: string,
) {
  const assessmentIsFirst =
    association.firstObjectKey === schemaKey;

  return {
    locationId: env.goHighLevelLocationId,
    associationId: association.id,
    firstRecordId: assessmentIsFirst ? recordId : contactId,
    secondRecordId: assessmentIsFirst ? contactId : recordId,
  };
}

function validateCreatedRelation(
  value: unknown,
  association: AssessmentAssociation,
  relationBody: ReturnType<typeof getOrientedRelationBody>,
) {
  const relation = parseOrFail(
    relationCreateResponseSchema,
    value,
    "assessment-relation-create-invalid-response",
  );

  if (
    relation.locationId !== relationBody.locationId ||
    relation.associationId !== relationBody.associationId ||
    relation.firstObjectKey !== association.firstObjectKey ||
    relation.secondObjectKey !== association.secondObjectKey ||
    relation.firstRecordId !== relationBody.firstRecordId ||
    relation.secondRecordId !== relationBody.secondRecordId
  ) {
    fail("assessment-relation-create-invalid-response");
  }
}

async function createAssessmentContactRelation(
  prepared: PreparedAutomationAssessment,
  recordId: string,
  contactId: string,
  leadId: string,
) {
  const association = prepared.configuration.association;

  if (
    await findAssessmentContactRelation(
      recordId,
      contactId,
      association.id,
      leadId,
    )
  ) {
    return;
  }

  const body = getOrientedRelationBody(
    association,
    prepared.configuration.mapping.schemaKey,
    recordId,
    contactId,
  );

  try {
    const response = await requestGoHighLevel({
      method: "POST",
      path: "/associations/relations",
      version: "v3",
      stage: "create-assessment-relation",
      leadId,
      body,
      expectedStatuses: [201],
      parseJson: true,
    });

    validateCreatedRelation(response, association, body);
  } catch (createError) {
    if (
      await findAssessmentContactRelation(
        recordId,
        contactId,
        association.id,
        leadId,
      )
    ) {
      return;
    }

    throw createError;
  }
}

export async function persistAutomationAssessment(
  prepared: PreparedAutomationAssessment,
  contactId: string,
  leadId: string,
): Promise<PersistedAutomationAssessment> {
  const { created, recordId } =
    await createOrRecoverAssessmentRecord(prepared, leadId);

  await createAssessmentContactRelation(
    prepared,
    recordId,
    contactId,
    leadId,
  );

  return Object.freeze({
    assessmentReference: prepared.assessmentReference,
    recordId,
    created,
  });
}

export function resetGoHighLevelAssessmentCacheForTests() {
  assessmentConfigurationPromise = undefined;
  assessmentConfigurationExpiresAt = 0;
}
