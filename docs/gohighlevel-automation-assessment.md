# GoHighLevel Automation Assessment Integration

## Submission Flow

Both forms validate the request, apply spam and shared client rate limits, verify
Turnstile, derive a stable lead ID from the browser's per-form-session
`submissionId`, and reserve the submission before provider writes.

Quick Request resolves or creates one Contact, applies configured website-lead
tags, and creates one Contact note with its stable lead ID. It does not call the
Objects or Associations APIs.

Automation Assessment uses this order:

1. The lead route performs its existing request, spam, rate-limit, Turnstile,
   and duplicate checks.
2. The assessment reference is derived from the stable lead ID as
   `TA-<lead ID>`.
3. The Worker reads and validates the object schema and association metadata.
   Successful metadata is cached for 15 minutes in the Worker isolate.
4. The Worker searches with an exact `eq` filter on the live
   `properties.<assessment-reference-key>` field and verifies the returned
   Assessment Reference exactly.
5. The shared Contact resolver searches email and phone independently. It
   updates the unambiguous Contact safely, or uses the existing upsert only when
   neither identifier matches.
6. The Worker creates the Custom Object record or recovers the existing record.
7. The Worker verifies or creates the Contact relation in the orientation
   returned by the live association.
8. Existing website-lead tags and assessment tags are applied.
9. A concise Contact note points staff to the associated structured record.
10. The existing route continues with its downstream processing and
    confirmation-email policy.

The route stores bounded CRM and complete-submission markers in Upstash when
configured, or in memory only when Upstash is not configured. With configured
Upstash, reservation, commit, release, and marker operations fail closed
instead of trusting isolate-local state. A downstream retry does not repeat
completed GoHighLevel work or confirmation email.

The five-minute processing lease and identity reservations are acquired in one
Redis Lua transaction. Definite provider failures release the matching identity
reservations. Durable provider success commits the 15-minute same-form cooldown
and 24-hour daily accounting before the lease is released. An ambiguous timeout
retains the short reservation while the next attempt recovers Contact, note,
Assessment, and relation state from stable identifiers. The in-isolate
implementation mirrors this behavior for local development; production
requires Upstash for distributed coordination.

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

- `contacts.readonly`
- `contacts.write`
- `objects/schema.readonly`
- `objects/record.readonly`
- `objects/record.write`
- `associations.readonly`
- `associations/relation.readonly`
- `associations/relation.write`

`contacts.readonly` is required for explicit Contact search and retry-safe note
lookup. `associations/relation.readonly` is required for retry-safe relation
creation. Add both to the existing Private Integration as needed; do not create
or rotate a token.

## Contact Identity Resolution

Email is the primary identity input and phone is the secondary identity input.
The Worker trims and lowercases email without altering aliases or domains. Phone
comparison removes display punctuation and accepts 7 to 15 digits; it does not
infer a country code. The submitted provider representation retains a leading
`+` when supplied. This means exact phone matching still depends on the stored
HighLevel number having the same country-code digits.

The Worker performs exact advanced Contact searches for email and, when
present, phone:

- Neither identifier matches: use `POST /contacts/upsert` with
  `createNewIfDuplicateAllowed: false`.
- Both identifiers match the same Contact: reuse that Contact.
- Only one identifier matches: reuse that Contact and fill the other identity
  field only when the existing field is empty.
- Email and phone match different Contacts: fail closed without updating,
  creating, associating, or confirming.
- One identifier returns multiple Contacts: fail closed without choosing a
  Contact.
- Search is unavailable or its response is invalid: fail closed.

Conflicts produce only the stable lead ID, category, masked identifiers, and
provider Contact IDs in safe server diagnostics. The public response is the same
generic contact-verification message for conflicts, ambiguous matches, and
provider failures, so the endpoint does not reveal whether an identifier exists.

After an unambiguous match, first and last names are filled only when missing.
Business name, validated Quick Request website, and timezone may receive a
nonempty submitted value. Omitted or blank values never clear Contact fields.
A different nonempty email or phone is never overwritten. Submission-specific
preferences remain in the new Quick Request note or Assessment record, which
preserves prior notes and Assessment records as history.

Quick Request and Automation Assessment identity cooldowns are separate. Either
form may follow the other immediately and both resolve to the same Contact.
Same-form cooldowns and daily limits use hashed email and phone; shared client
rate limits remain cross-form.

Exact Redis key formats are:

- `lead:idempotency:<submissionType>:v2:processing:<leadId>`
- `lead:idempotency:<submissionType>:v2:gohighlevel-completed:<leadId>`
- `lead:idempotency:<submissionType>:v2:completed:<leadId>`
- `lead:cooldown:<submissionType>:v1:<email|phone>:<24-char SHA-256>`
- `lead:daily:<submissionType>:v1:<email|phone>:<24-char SHA-256>`
- `lead:rate:<hour|day>:<24-char SHA-256 client signal>`

Raw email, phone, and IP values never appear in Redis keys.

## Manual HighLevel Settings

Application-level resolution fails safely regardless of dashboard duplicate
preferences. Nicolas must still confirm the sub-account settings manually:

1. Open **Settings**, then **Business Profile**.
2. Open **Contact Deduplication Preferences**.
3. Confirm **Allow Duplicate Contact** is off.
4. Confirm the primary matching field is **Email**.
5. Confirm the secondary matching field is **Phone**.

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
| Search Contacts | `POST /contacts/search` | `contacts.readonly` | `200` | redacted provider error |
| Update Contact | `PUT /contacts/{contactId}` | `contacts.write` | `200` | redacted provider error |
| Upsert Contact | `POST /contacts/upsert` | `contacts.write` | `200` | redacted provider error |
| Add Contact tags | `POST /contacts/{contactId}/tags` | `contacts.write` | `201` | redacted provider error |
| Read Contact notes | `GET /contacts/{contactId}/notes` | `contacts.readonly` | `200` | redacted provider error |
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

- Contact searches are read-only and use bounded retries for documented
  transient responses.
- New-Contact upsert retains `createNewIfDuplicateAllowed: false`. An ambiguous
  upsert result is recovered by repeating explicit Contact resolution rather
  than blindly posting again.
- A Quick Request or Assessment note contains the stable `Lead ID` marker.
  Note creation uses a preflight lookup and an ambiguous create result is
  recovered with another lookup, so a retry does not create a second note.
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

1. Confirm the required scopes and manual duplicate-preference checklist above.
2. Use a controlled Tergion test alias and entirely fictional data.
3. Submit one Quick Request and confirm one Contact and one Quick Request note.
4. Submit one Automation Assessment with the same email and phone. Confirm the
   same Contact is reused and the Quick Request note remains unchanged.
5. Confirm one Automation Assessment record has `TA-<lead ID>` as its
   Assessment Reference and all dropdown fields contain their configured
   options.
6. Confirm the assessment is related to that Contact using the configured
   association.
7. Retry the identical browser submission and confirm the record, relation,
   note, and confirmation email are not duplicated.
8. After the same-form cooldown, submit a second Assessment and confirm a second
   assessment record is created.
9. Repeat the sequence in reverse with a second fictional identity: Assessment
   first, then Quick Request. Confirm one shared Contact and no extra Assessment.
10. Submit deliberately conflicting test identifiers only in a controlled
    non-customer account and confirm the public response reveals no Contact
    existence and no CRM write occurs.
11. Review Worker logs for only redacted correlation metadata.
12. Do not edit or delete `TA-MANUAL-TEST-001`.

## Official References

- [Get object schema by key](https://marketplace.gohighlevel.com/docs/ghl/objects/get-object-schema-by-key/)
- [Search object records](https://marketplace.gohighlevel.com/docs/ghl/objects/search-object-records/)
- [Create object record](https://marketplace.gohighlevel.com/docs/ghl/objects/create-object-record/)
- [HighLevel Objects record reference](https://doc.clickup.com/8631005/d/h/87cpx-277156/93bf0c2e23177b0/87cpx-376276)
- [Get association by key](https://marketplace.gohighlevel.com/docs/ghl/associations/get-association-key-by-key-name/)
- [Get relations by record ID](https://marketplace.gohighlevel.com/docs/ghl/associations/get-relations-by-record-id/)
- [Create relation](https://marketplace.gohighlevel.com/docs/ghl/associations/create-relation/)
- [HighLevel Associations and Relations reference](https://doc.clickup.com/8631005/d/h/87cpx-293776/cd0f4122abc04d3/87cpx-384436)
- [Advanced Contact search](https://marketplace.gohighlevel.com/docs/ghl/contacts/search-contacts-advanced/)
- [Get Contact](https://marketplace.gohighlevel.com/docs/ghl/contacts/get-contact/)
- [Update Contact](https://marketplace.gohighlevel.com/docs/ghl/contacts/update-contact/)
- [Upsert Contact](https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact/)
- [Read Contact notes](https://marketplace.gohighlevel.com/docs/ghl/contacts/get-all-notes/)
- [Create Contact note](https://marketplace.gohighlevel.com/docs/ghl/contacts/create-note/)
- [HighLevel API scopes](https://marketplace.gohighlevel.com/docs/Authorization/Scopes/)
