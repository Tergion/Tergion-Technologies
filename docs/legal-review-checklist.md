# Legal Review Checklist

This checklist records unresolved business and attorney decisions. Public legal
pages are implementation-aligned drafts and are not a substitute for legal
review or operational privacy controls.

## Terms decisions

- [ ] Approve the current public-site liability approach. The July 26, 2026
  draft uses Option 3: category exclusions without an aggregate public-site
  cap. It does not use the reel's simple prior-12-month fees formula because
  ordinary website visitors pay no website fee, and no fixed fallback amount
  has business or attorney approval.
- [ ] Decide whether a modest fixed public-site cap should replace Option 3.
  Do not publish a dollar amount until the business and counsel approve it.
- [ ] Establish fee-based aggregate caps, damage exclusions, warranty terms,
  and risk allocation for paid work in a Master Services Agreement, Statement
  of Work, subscription agreement, or other signed client contract.
- [ ] Confirm that Washington remains consistent with actual company
  operations before relying on the governing-law provision.
- [ ] Select a Washington county only after the company's principal place of
  business and intended forum are formally confirmed. The public Terms
  currently require only a Washington court with jurisdiction and proper venue
  under applicable law.
- [ ] Mandatory arbitration is not approved and is not included.
- [ ] A class-action waiver is not approved and is not included.
- [ ] A jury-trial waiver is not approved and is not included.
- [ ] A shortened contractual limitations period is not approved and is not
  included.
- [ ] Review the third-party-claim indemnity, exclusions, defense control, and
  settlement procedure for proportionality to public website users.
- [ ] Review user-authority and prohibited-conduct language against the
  intended scope of future assessments, file transfers, and client work before
  enabling uploads or accepting customer datasets.

## Privacy and retention decisions

- [ ] Review the Privacy Policy for current website collection, specific
  purposes, disclosures, retention criteria, deletion handling, and user
  request procedures.
- [ ] Review the Data Notice at collection and keep its provider, purpose,
  retention, sale, and advertising statements synchronized with the full
  policy and form implementation.
- [ ] Implement and document a periodic review process for unresolved Quick
  Requests and Automation Assessments. A 24-month review target was previously
  stated publicly, but the inspected implementation has no automated
  24-month GoHighLevel cleanup. Do not restore a fixed public promise until the
  responsible party, report, deletion steps, exception handling, and evidence
  of completion are operational.
- [ ] Verify that GoHighLevel deletion procedures separately address Contacts,
  notes, tags, Automation Assessment Custom Object records, associations, and
  any restorable-deletion period. Deleting only a Contact is not assumed to
  remove every related record.
- [ ] Confirm the active Cloudflare Workers plan, whether Workers Logs is
  enabled, the configured sampling, and actual dashboard retention. Current
  provider documentation states a maximum of 3 days on Workers Free and 7 days
  on Workers Paid, but `wrangler.jsonc` does not configure observability.
- [ ] Confirm Upstash database backup settings. Application rate-limit and
  duplicate-control keys have code-enforced TTLs from minutes through 24
  hours; provider backups, if enabled, follow separate provider controls.
- [ ] Confirm the selected production email provider and its account-specific
  retention. Postmark documents a 45-day default for message content, events,
  and metadata, configurable from 7 to 365 days. Resend documents
  criteria-based active-account processing and deletion within 90 days after
  account termination but does not establish an inspected account-specific
  active-message period.
- [ ] Assign a privacy/records owner responsible for CRM reviews, deletion
  requests, consent records, opt-outs and suppressions, provider settings,
  legal holds, and evidence of completed deletion.
- [ ] Review the internal [Data Retention Matrix](data-retention-matrix.md)
  at least annually and whenever a provider, form field, workflow, contract,
  or public retention statement changes.
- [ ] Review CCPA/CPRA applicability as revenue, audience, or data volume
  changes. The current purpose and retention language follows useful
  principles without claiming that the statute necessarily applies.
- [ ] Review GDPR and international scope before targeting or materially
  serving non-U.S. visitors. Website accessibility alone is not treated as
  proof that GDPR applies.

## Company and launch decisions

- [ ] Final legal entity name approval.
- [ ] Physical mailing address decision before marketing email campaigns or
  other notices that require a postal address.
- [ ] AI Disclosure review for internal AI-assisted planning, drafting,
  summarization, and workflow support.
- [ ] Third-Party Notices review before any provider is marked active.
- [ ] Accessibility statement review before making conformance or audit claims.
- [ ] CAN-SPAM setup before marketing email campaigns, including postal
  address, sender identity, and opt-out process.
- [ ] SMS/TCPA operational review before automated SMS campaigns or text-back
  workflows.
- [ ] Review/testimonial compliance review before adding Google reviews,
  testimonials, ratings, or public feedback widgets.
- [ ] Live provider list review before enabling analytics, Google Sheets
  append, transactional email sending, chatbot features, or review widgets;
  confirm GoHighLevel lead routing disclosures before production use.
- [ ] GoHighLevel and client service contract terms review before using CRM
  access, client logins, paid SaaS-style services, or managed client systems.
- [ ] User-generated content policy only if future accounts, uploads, comments,
  chatbot logs, or client portal features are added.
- [ ] Codebase license review. The repository is marked proprietary, all rights
  reserved, and `UNLICENSED` in package metadata.

## Authoritative sources reviewed

- Washington Courts, *Riley v. Iron Gate Self Storage* (strict construction,
  public-policy and gross-negligence limits for exculpatory or limiting
  provisions):
  https://www.courts.wa.gov/opinions/pdf/D2%2047905-2-II%20Published%20Opinion.pdf
- California Civil Code sections 1798.100 and 1798.105 (notice, purpose,
  retention criteria, and deletion exceptions):
  https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.100.
  and
  https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.105.
- Federal Trade Commission, *Start with Security* (limited collection,
  retention, access, and disposal):
  https://www.ftc.gov/business-guidance/resources/start-security-guide-business
- Cloudflare Workers Logs:
  https://developers.cloudflare.com/workers/observability/logs/workers-logs/
- Upstash REST API:
  https://upstash.com/docs/redis/features/restapi
- HighLevel contact and Custom Object deletion documentation:
  https://help.gohighlevel.com/support/solutions/articles/155000000583
  and
  https://help.gohighlevel.com/support/solutions/articles/155000007906-bulk-delete-for-custom-object-records
- Postmark activity retention:
  https://postmarkapp.com/support/article/how-long-are-inbound-and-outbound-messages-stored-in-activity
- Resend Data Processing Addendum:
  https://resend.com/legal/dpa
