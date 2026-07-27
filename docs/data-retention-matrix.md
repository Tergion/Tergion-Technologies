# Internal Data Retention Matrix

Last reviewed: July 26, 2026

Internal operational document. Do not publish this matrix or its security-
specific timing details as a public policy. Public statements must remain
consistent with `features/legal/legal-content.ts`.

The website has no application database. Live accepted submissions are
designed to persist in GoHighLevel when production credentials are configured.
The periods below are working controls or review targets, not claims that an
unimplemented deletion job already runs.

| Data category | System or provider | Business purpose | Working retention period | Deletion or restriction method | Responsible party | Exceptions | Public policy aligned? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Unresolved Quick Request | GoHighLevel Contact, Contact note, and tags | Respond to inquiry, manage prospect, document preferences and consent | Review target at 24 months after the last meaningful interaction; no automated job exists | Manual review; delete or restrict the Contact and verify notes, tags, and separately retained records | Designated privacy/records owner | Active conversation, consent or opt-out evidence, dispute, fraud, security, legal hold | Yes; public policy uses criteria and discloses that 24 months is not automated |
| Unresolved Automation Assessment | GoHighLevel Contact, note, Automation Assessment Custom Object record, and association | Review assessment and identify possible workflow opportunities | Review target at 24 months after the last meaningful interaction; no automated job exists | Review and delete or restrict the Contact and the separate Custom Object record; verify association handling | Designated privacy/records owner | Active conversation, consent or opt-out evidence, dispute, fraud, security, legal hold | Yes |
| Active prospect communications | GoHighLevel and business email account | Continue requested follow-up and preserve conversation context | While active, then review when no longer reasonably relevant | Close follow-up, remove unnecessary content, delete or restrict record as appropriate | Prospect owner and privacy/records owner | Conversion to client, dispute, contract, legal hold, consent or opt-out evidence | Yes |
| Converted client records | CRM, business email, and future client systems | Deliver and document contracted services, support, accounting, and relationship history | Governed by the signed client agreement and approved accounting/legal schedule; not set by Website Terms | Contract-specific offboarding, deletion, return, or restriction process | Client owner and privacy/records owner | Accounting, tax, contract, dispute, legal hold, security | Yes; public policy reserves client-specific periods |
| GoHighLevel Contact | GoHighLevel | Contact management, identity resolution, preferences, follow-up, notes, and tags | Same as the controlling prospect or client record | Admin deletion or approved workflow; provider documentation states deleted Contacts may remain restorable for up to 60 days | GoHighLevel administrator | Consent, opt-out, suppression, dispute, fraud, security, legal hold | Yes |
| Automation Assessment Custom Object | GoHighLevel | Preserve assessment answers and relate them to the submitting Contact | Same as the associated unresolved assessment, prospect, or client record | Delete the Custom Object record separately; verify related associations and notes | GoHighLevel administrator | Dispute, fraud, security, legal hold, active relationship | Yes |
| Transactional confirmation email | Resend initially; Postmark supported fallback; recipient mail system | Confirm receipt and provide correction and legal links | Account/provider setting; verify before launch and on provider changes. Postmark default is 45 days, configurable 7–365 days. Resend active-message period is not confirmed from repo or public account settings | Provider expiration or provider/admin deletion where supported | Email administrator | Delivery troubleshooting, bounce, complaint, security, legal hold | Yes; public policy uses provider-setting criteria |
| Consent and preference record | GoHighLevel notes and assessment fields | Document contact authorization, policy acknowledgement, selected follow-up, and optional SMS choice | Keep while reasonably needed to document and honor the choice, potentially longer than the inquiry | Restrict to minimum evidence; delete when no longer legally or operationally needed | Privacy/records owner | Dispute, complaint, legal obligation, proof of consent or withdrawal | Yes |
| Opt-out and suppression record | GoHighLevel and selected communication provider | Prevent unwanted or undeliverable communications and document the request | Keep the minimum record while needed to honor the opt-out or suppression | Suppress communication; retain only minimum identifier and reason; remove only when lawful and safe | Communications administrator | Legal obligation, complaint, deliverability, fraud prevention | Yes |
| Processing lease | Upstash Redis or in-memory fallback | Prevent concurrent duplicate provider writes | 5 minutes | Automatic TTL or isolate/process memory expiry | Engineering owner | None expected | Yes; described publicly only as a short operational period |
| Same-form duplicate cooldown | Upstash Redis or in-memory fallback | Prevent rapid repeat submissions | 15 minutes after durable CRM success | Automatic TTL or isolate/process memory expiry | Engineering owner | Security investigation may rely on separate logs | Yes |
| Daily duplicate-control and completion state | Upstash Redis or in-memory fallback | Limit repeated submissions and preserve short-term idempotency | Up to 24 hours | Automatic TTL or isolate/process memory expiry | Engineering owner | Security investigation may rely on separate logs | Yes |
| Rate-limit keys | Upstash Redis or in-memory fallback | Limit abusive request volume | One-hour and 24-hour windows | Automatic `EXPIRE` or isolate/process memory expiry | Engineering owner | Security investigation may rely on separate logs | Yes |
| Application and security logs | Cloudflare Workers Logs if enabled | Diagnose provider failures, abuse, and security events | Provider plan and dashboard setting. Cloudflare currently documents 3 days on Workers Free and 7 days on Workers Paid; repository config does not prove logging is enabled | Provider expiration; restrict access; preserve a limited incident record only when needed | Cloudflare administrator and engineering owner | Active fraud/security investigation, dispute, legal hold | Yes |
| GoHighLevel API operational logs | Application logs and GoHighLevel provider systems | Diagnose CRM delivery and record conflicts | Application portion follows Workers Logs; provider portion requires account/contract verification | Provider controls and support request where applicable | GoHighLevel administrator | Fraud, security, dispute, legal hold | Yes; provider-specific period is not promised |
| Email delivery, bounce, complaint, and suppression logs | Selected email provider | Delivery, troubleshooting, abuse prevention, and sender reputation | Provider/account setting; suppression evidence may outlast message content | Provider expiration, account control, or support request | Email administrator | Bounce/complaint suppression, security, legal hold | Yes |
| Cloudflare request, Turnstile, and platform logs | Cloudflare | Hosting, routing, bot protection, and platform security | Product, plan, and account setting; verify in dashboard. Do not assume every Cloudflare log shares Workers Logs retention | Provider expiration and account controls | Cloudflare administrator | Security investigation, abuse, dispute, legal hold | Yes; public policy uses provider-setting criteria |
| Provider backups and recovery copies | GoHighLevel, Upstash if backups enabled, email provider, Cloudflare where applicable | Reliability and disaster recovery | Normal provider backup and restoration cycles; settings require operator verification | Provider lifecycle; do not promise selective deletion from immutable backup media | Provider administrator and privacy/records owner | Legal hold, security event, disaster recovery | Yes |

## Required operating procedure

1. Assign the named responsibilities above to actual personnel.
2. Create a quarterly report for unresolved Quick Requests and Automation
   Assessments, including last meaningful interaction and relationship status.
3. At the 24-month review target, delete, deidentify, or restrict each record
   unless an approved exception applies.
4. For an Automation Assessment, review the Contact, Contact note, Custom
   Object record, association, consent evidence, email record, and any
   suppression record separately.
5. Record the decision, exception, approver, action date, and systems checked
   without recreating unnecessary personal information.
6. For an approved privacy deletion request, verify identity or authority,
   identify each active system and provider, apply lawful exceptions narrowly,
   complete supported deletions, and record what remains restricted and why.
7. Do not restore deleted personal information from a backup into ordinary
   use. If a backup is restored, reapply approved deletion and suppression
   instructions before resuming normal processing where technically supported.
8. Reconcile this matrix, provider settings, and public policy whenever a form,
   provider, retention control, or client-service model changes.
