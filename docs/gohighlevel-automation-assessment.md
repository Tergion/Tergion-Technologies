# GoHighLevel Automation Assessment Integration

## Submission Flow

Quick Request keeps the existing GoHighLevel flow: Contact upsert, configured
website-lead tags, and the existing Contact note. It does not call the Objects
or Associations APIs.

Automation Assessment uses this order:

1. The lead route performs its existing request, spam, rate-limit, Turnstile,
   and duplicate checks.
2. A stable server-side lead ID is derived from the form's UUID submission
   nonce. The assessment reference is `TA-<lead ID>`.
3. The Worker reads and validates the object schema and association metadata.
   Successful metadata is cached for 15 minutes in the Worker isolate.
4. The Worker searches with an exact `eq` filter on the live
   `properties.<assessment-reference-key>` field and verifies the returned
   Assessment Reference exactly.
5. The existing Contact upsert runs with the existing identity, source, and
   duplicate settings.
6. The Worker creates the Custom Object record or recovers the existing record.
7. The Worker verifies or creates the Contact relation in the orientation
   returned by the live association.
8. Existing website-lead tags and assessment tags are applied.
9. A concise Contact note points staff to the associated structured record.
10. The existing route continues with its downstream processing and
    confirmation-email policy.

The route records bounded assessment CRM-completion markers in Upstash when
configured, or in memory only when Upstash is not configured. With configured
Upstash, marker reads and writes fail closed instead of trusting isolate-local
state. A downstream retry does not repeat already completed GoHighLevel work.
The complete-submission marker also keeps a successful duplicate browser
request from resending the confirmation email.
A five-minute per-reference processing lease uses Redis `SET NX` when Upstash
is configured. Lease acquisition fails closed if configured Redis is
unavailable, so concurrent Worker isolates cannot both create notes or send
confirmations. The in-isolate lease is for local environments without Upstash;
production requires Upstash for distributed coordination.

## Runtime Configuration

The integration reuses the existing Private Integration Token and location:

- `GHL_PRIVATE_INTEGRATION_TOKEN`
- `GHL_LOCATION_ID`
- `GHL_SOURCE`
- `GHL_LEAD_TAGS`

It adds two non-secret, server-only identifiers:

- `GHL_ASSESSMENT_OBJECT_SCHEMA_KEY`
  - Expected value: `custom_objects.automation_assessment`
- `GHL_ASSESSMENT_CONTACT_ASSOCIATION_KEY`
  - Expected value: `automation_assessments_submitted_by`

The association ID is not hardcoded. The Worker retrieves it from the live
association metadata by configured key and validates the object keys, labels,
type, location, and relation orientation before using it.

The same Private Integration must have:

- `contacts.write`
- `objects/schema.readonly`
- `objects/record.readonly`
- `objects/record.write`
- `associations.readonly`
- `associations/relation.readonly`
- `associations/relation.write`

`associations/relation.readonly` is needed to make relation creation retry-safe.
Add it to the existing Private Integration; do not create or rotate a token.

## Verified API Contracts

All calls support the existing Sub-Account Private Integration Token and use
the endpoint-specific `Version: v3` header:

| Operation | Method and path | Scope | Success | Documented permanent errors |
| --- | --- | --- | --- | --- |
| Read object schema | `GET /objects/{schemaKey}` | `objects/schema.readonly` | `200` | `400`, `401`, `422` |
| Search object records | `POST /objects/{schemaKey}/records/search` | `objects/record.readonly` | `200` | `400`, `401` |
| Create object record | `POST /objects/{schemaKey}/records` | `objects/record.write` | `201` | `400`, `401` |
| Read association by key | `GET /associations/key/{key}` | `associations.readonly` | `200` | `400`, `401`, `422` |
| Read record relations | `GET /associations/relations/{recordId}` | `associations/relation.readonly` | `200` | `400`, `401`, `422` |
| Create relation | `POST /associations/relations` | `associations/relation.write` | `201` | `400`, `401`, `422` |
| Upsert Contact | `POST /contacts/upsert` | `contacts.write` | `200` | redacted provider error |
| Add Contact tags | `POST /contacts/{contactId}/tags` | `contacts.write` | `201` | redacted provider error |
| Create Contact note | `POST /contacts/{contactId}/notes` | `contacts.write` | `201` | redacted provider error |

Schema and association reads send `locationId`; schema discovery also sends
`fetchProperties=true`. Relation reads send bounded `skip`, `limit`, and the
single live `associationIds` value. Record search sends `locationId`, bounded
pagination, the plain Assessment Reference query required by the generated v3
contract, and an exact nested `properties.<key> eq <reference>` filter.

The Objects reference linked from HighLevel's API page documents record
creation as:

```json
{
  "locationId": "<location>",
  "properties": {
    "<short property key>": "<value>"
  }
}
```

The Associations reference linked from HighLevel's API page documents relation
creation as:

```json
{
  "locationId": "<location>",
  "associationId": "<live association ID>",
  "firstRecordId": "<record for the live first object>",
  "secondRecordId": "<record for the live second object>"
}
```

The implementation does not apply a single legacy API version globally.
HighLevel does not document a distinct unique-field conflict response for
record creation or a duplicate-relation response. The implementation therefore
does not guess one: every failed record create is followed by an exact record
search, and relation creation uses a preflight read plus a recovery read.
Validation and authorization bodies are never returned or logged. `429` and
`5xx` responses are retried only for read-only operations; writes rely on
recovery reads.

## Field Mapping Contract

The code matches the exact live field label and type, derives the short record
property key only from the confirmed schema-key prefix, and resolves dropdown
labels to the live option keys. Expected internal property names are shown for
review, but they are not trusted without the live schema response.

| Website value | HighLevel field label | Expected property | Type |
| --- | --- | --- | --- |
| Generated reference | Assessment Reference | `assessment_reference` | `TEXT` |
| `preferredContactMethod` | Preferred Contact Method | `preferred_contact_method` | `SINGLE_OPTIONS` |
| `schedulingPreference` | Scheduling Preference | `scheduling_preference` | `TEXT` |
| `industry` | Industry | `industry` | `TEXT` |
| `monthlyLeadRange` | Monthly Lead Range | `monthly_lead_range` | `SINGLE_OPTIONS` |
| `customerValueRange` | Average Customer Value | `average_customer_value` | `SINGLE_OPTIONS` |
| `websiteInquiryProcess` | Website Inquiry Process | `website_inquiry_process` | `SINGLE_OPTIONS` |
| `incomingCallOwner` | Incoming Call Owner | `incoming_call_owner` | `SINGLE_OPTIONS` |
| `incomingCallOwnerOther` | Incoming Call Owner Other | `incoming_call_owner_other` | `TEXT` |
| `missedCallProcess` | Missed Call Process | `missed_call_process` | `SINGLE_OPTIONS` |
| `leadResponseTime` | Lead Response Time | `lead_response_time` | `SINGLE_OPTIONS` |
| `quoteFollowUpProcess` | Quote Follow-Up Process | `quote_follow_up_process` | `SINGLE_OPTIONS` |
| `pipelineVisibility` | Pipeline Visibility | `pipeline_visibility` | `SINGLE_OPTIONS` |
| `leadTrackingMethod` | Lead Tracking Method | `lead_tracking_method` | `SINGLE_OPTIONS` |
| `biggestChallenge` | Biggest Challenge | `biggest_challenge` | `SINGLE_OPTIONS` |
| `biggestChallengeOther` | Biggest Challenge Other | `biggest_challenge_other` | `TEXT` |
| `assessmentFollowUpPreference` | Assessment Follow-Up Preference | `assessment_follow_up_preference` | `SINGLE_OPTIONS` |
| `additionalNotes` | Additional Notes | `additional_notes` | `LARGE_TEXT` |
| `contactConsent` | Contact Consent | `contact_consent` | `SINGLE_OPTIONS` |
| `privacyTermsConsent` | Privacy and Terms Consent | `privacy_terms_consent` | `SINGLE_OPTIONS` |
| `smsConsent` | SMS Consent | `sms_consent` | `SINGLE_OPTIONS` |

Website enum values are matched to the existing user-facing option labels.
Those labels are then matched to the live schema's option labels, and only the
corresponding live option keys are sent. Consent booleans use the live keys for
the `Yes` and `No` labels.

Contact identity remains only on the standard Contact. `Landing Page`,
`Trigger Source`, attribution, abuse signals, and provider metadata are not
included in Custom Object properties.

## Validation And Recovery

The Worker fails closed before Contact upsert if any required object label,
field label, type, primary display property, dropdown label, schema key,
association key, object pair, association label, or association orientation
differs.

The current documented HighLevel v3 object-schema response does not expose the
field's unique-setting flag or guarantee `searchableProperties` metadata.
Runtime validation therefore confirms that Assessment Reference is the primary
field and record recovery uses an exact property filter. The production Custom
Object must retain its manually configured unique setting.

HighLevel's association-read response does not expose cardinality. The Worker
validates both object sides and their labels, honors the returned orientation,
and refuses to associate one assessment record with more than one Contact.
Multiple assessment records may still relate to the same Contact.

Recovery behavior:

- Contact upsert is reused as the existing duplicate-aware operation.
- Record search requires an exact Assessment Reference and matching stored
  properties before an existing record is reused.
- A failed or ambiguous record create is followed by an exact search; the
  original error is retained if no record exists.
- Relation creation is preceded by a relation read.
- A failed or ambiguous relation create is followed by another relation read.
- Automatic retries are limited to read-only operations and documented
  transient network, `429`, and `5xx` conditions. A `Retry-After` value within
  the two-second request-delay cap is honored exactly; a longer value stops the
  local retry instead of retrying early or blocking the Worker.
- An ambiguous assessment-note response is not automatically retried because
  note creation is non-idempotent. Core Contact, assessment, and relation
  persistence remains successful, and the safe correlation ID is logged.
- Confirmation-email failure remains nonfatal after primary persistence.

## Security

- Tokens and raw provider responses remain server-only.
- Request bodies, Contact data, assessment answers, authorization headers, and
  response bodies are never written to logs.
- Provider errors contain only a safe stage, status, kind, and lead ID.
- Requests use bounded response reads and a Worker-compatible timeout.
- External JSON is runtime-validated.
- API paths use only validated configuration and provider record IDs, never
  client-supplied schema keys or association IDs.
- Discovery uses read-only schema and association endpoints and performs no
  schema, field, association, Contact, or record writes.

## Production Smoke Test

After deployment:

1. Use a controlled Tergion test alias and entirely fictional assessment data.
2. Submit one Automation Assessment.
3. Confirm one Contact is upserted.
4. Confirm one Automation Assessment record has `TA-<lead ID>` as its
   Assessment Reference and all dropdown fields contain their configured
   options.
5. Confirm the assessment is related to that Contact using the configured
   association.
6. Retry the identical browser submission and confirm the record, relation,
   note, and confirmation email are not duplicated.
7. Submit a second assessment for the same test Contact and confirm a second
   assessment record is created.
8. Submit a Quick Request and confirm it creates no Automation Assessment
   record.
9. Review Worker logs for only redacted correlation metadata.
10. Do not edit or delete `TA-MANUAL-TEST-001`.

## Official References

- [Get object schema by key](https://marketplace.gohighlevel.com/docs/ghl/objects/get-object-schema-by-key/)
- [Search object records](https://marketplace.gohighlevel.com/docs/ghl/objects/search-object-records/)
- [Create object record](https://marketplace.gohighlevel.com/docs/ghl/objects/create-object-record/)
- [HighLevel Objects record reference](https://doc.clickup.com/8631005/d/h/87cpx-277156/93bf0c2e23177b0/87cpx-376276)
- [Get association by key](https://marketplace.gohighlevel.com/docs/ghl/associations/get-association-key-by-key-name/)
- [Get relations by record ID](https://marketplace.gohighlevel.com/docs/ghl/associations/get-relations-by-record-id/)
- [Create relation](https://marketplace.gohighlevel.com/docs/ghl/associations/create-relation/)
- [HighLevel Associations and Relations reference](https://doc.clickup.com/8631005/d/h/87cpx-293776/cd0f4122abc04d3/87cpx-384436)
- [HighLevel API scopes](https://marketplace.gohighlevel.com/docs/Authorization/Scopes/)
