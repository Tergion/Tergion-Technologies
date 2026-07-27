import { siteConfig } from "@/lib/site-config";

export type LegalStatus =
  | "Active"
  | "Configured"
  | "Planned"
  | "Not currently active";

export type LegalListItem = {
  label?: string;
  text: string;
  status?: LegalStatus;
  href?: string;
  hrefLabel?: string;
};

export type LegalSection = {
  heading: string;
  body?: string[];
  items?: LegalListItem[];
};

export type LegalContactInfo = {
  label: string;
  email: string;
};

export type LegalPageContent = {
  title: string;
  intro: string;
  effectiveDate: string;
  lastUpdatedDate: string;
  sections: LegalSection[];
  contact: LegalContactInfo;
};

export type LegalPageSlug =
  | "privacy"
  | "terms"
  | "ai-disclosure"
  | "data-notice"
  | "third-party-notices"
  | "accessibility";

const companyName = siteConfig.publicBrandName;
const contactEmail = siteConfig.contactEmail;
const privacyEmail = siteConfig.privacyEmail;
const effectiveDate = siteConfig.policyEffectiveDate;
const lastUpdatedDate = siteConfig.policyLastUpdatedDate;
const formLegalLastUpdatedDate = "July 26, 2026";
const jurisdiction = siteConfig.jurisdiction;

const defaultContact = {
  label: "Contact",
  email: contactEmail,
};

export const legalPages: Record<LegalPageSlug, LegalPageContent> = {
  privacy: {
    title: "Privacy Policy",
    effectiveDate,
    lastUpdatedDate: formLegalLastUpdatedDate,
    intro: `${companyName} respects privacy. This Privacy Policy explains how we collect, use, disclose, retain, and protect information through tergion.com, website request forms, and related website communications.`,
    contact: {
      label: "Privacy Contact",
      email: privacyEmail,
    },
    sections: [
      {
        heading: "Scope",
        body: [
          "This policy applies to tergion.com and the website request, assessment, and related communication interactions controlled by Tergion Technologies.",
          "It does not govern third-party websites, client systems, CRM accounts, automation platforms, or other services that Tergion Technologies does not control. A signed client agreement may provide additional privacy, security, and service terms for paid work.",
        ],
      },
      {
        heading: "Categories of Information Collected",
        body: [
          "Depending on how you interact with the website, Tergion Technologies collects contact and business identifiers, request or assessment answers, communication and consent preferences, website attribution information, communications, and limited technical and security information.",
          "Please do not submit passwords, customer lists or records, financial account or payment-card details, health information, regulated data, or another party's personal or confidential information through a website form.",
        ],
      },
      {
        heading: "Quick Request Information",
        body: [
          "A Quick Request requires first name, business name, email, preferred contact method, a free-text scheduling preference, contact consent, and privacy and terms acknowledgement. Phone is required only when phone or text is selected as the preferred contact method.",
          "Optional Quick Request information may include last name, phone, website, industry, business size, location or service area, whether the business uses a CRM, current CRM, automation interests, request priority, notes, and other business context you choose to provide.",
          "The form also records optional SMS consent, the form version, an AI-disclosure indicator, and request attribution or security fields described below.",
        ],
      },
      {
        heading: "Automation Assessment Information",
        body: [
          "The Business Automation Assessment collects first name, optional last name, business name, email, phone, preferred contact method, scheduling preference, industry, approximate monthly lead volume, optional approximate customer value, website or message inquiry handling, incoming-call ownership, missed-call practices, lead response-time practices, optional quote follow-up practices, optional pipeline visibility, optional lead and customer tracking method, operational challenge, follow-up preference, and optional assessment notes.",
          "The assessment also records contact consent, privacy and terms acknowledgement, optional SMS consent, the form version, an AI-disclosure indicator, and request attribution or security fields described below.",
        ],
      },
      {
        heading: "Technical and Security Information",
        body: [
          "Technical, attribution, and security information may include browser or device metadata available in a request, referrer, landing page, timezone, UTM parameters if present, completion timing, honeypot signals, hashed or otherwise limited rate-limit and duplicate-control signals, and Cloudflare Turnstile verification results when Turnstile is configured.",
          "Tergion application and provider logs may record limited operational metadata, such as a generated request identifier, provider name, processing stage, response status, and masked contact diagnostics when an error needs review. The application is designed not to log full form payloads, raw provider response bodies, or full IP addresses.",
          "Communications with Tergion Technologies, including emails or messages sent to or from us, may be retained with the related prospective-client record.",
        ],
      },
      {
        heading: "Purposes of Processing",
        items: [
          {
            label: "Quick Request contact and business information",
            text: "Used to receive and respond to an inquiry, understand the requested business context, manage a prospective-client record, assign internal follow-up, send a transactional confirmation when configured, and communicate according to the selected contact and scheduling preferences.",
          },
          {
            label: "Automation Assessment answers",
            text: "Used to review the assessment, identify possible workflow, CRM, follow-up, and automation opportunities, prepare a response or internal planning notes, create and manage the related GoHighLevel contact and Automation Assessment records when the integration is configured, and honor the selected follow-up preference.",
          },
          {
            label: "Contact, consent, and preference records",
            text: "Used to document the requested communication method, scheduling preference, contact authorization, policy acknowledgement, optional SMS choice, assessment follow-up choice, and later opt-out or suppression instructions.",
          },
          {
            label: "Technical, attribution, and security information",
            text: "Used to operate and protect the website, validate submissions, prevent spam, abuse, fraud, and repeated submissions, investigate security or delivery events, diagnose failures, and understand how a request reached the form.",
          },
          {
            label: "Communications and transactional email records",
            text: "Used to respond to the request, preserve relevant conversation history, provide and troubleshoot confirmations, manage follow-up, and document corrections, consent changes, or opt-outs.",
          },
          {
            label: "Legal and limited service improvement purposes",
            text: "Relevant information may be used to comply with legal and recordkeeping obligations, protect the website and Tergion Technologies, resolve disputes, investigate fraud or security events, and improve Tergion processes and services using information limited to what is appropriate for that purpose.",
          },
        ],
      },
      {
        heading: "Purpose Limitation",
        body: [
          "Tergion Technologies uses information for the specific purposes described at collection and in this policy, or for another purpose that is reasonably compatible with the context in which the information was provided. We do not authorize unrelated use through a general 'any business purpose' or 'any commercial purpose' provision.",
          "If Tergion Technologies later plans to use personal information for a materially different purpose, it will provide an appropriate updated notice before that use and obtain consent when applicable law requires it.",
          "Assessment responses are not sold and are not used for unrelated advertising in the inspected website implementation.",
        ],
      },
      {
        heading: "AI-Assisted Processing",
        body: [
          "Tergion Technologies may use AI-assisted tools to organize submitted information, summarize requests, develop workflow ideas, support internal planning, and prepare implementation notes.",
          "AI-assisted outputs are reviewed before being used for client recommendations or implementations. AI tools can be inaccurate, incomplete, or outdated and are not a substitute for business judgment, professional advice, security review, or compliance review.",
          "Do not submit confidential, regulated, sensitive, or third-party personal information for AI-assisted planning unless it is necessary and you have authority to provide it.",
        ],
      },
      {
        heading: "Service Providers and Disclosures",
        body: [
          "We disclose information only as reasonably needed for the purposes described in this policy, including to providers that support hosting, website security, form protection, transactional communications, CRM and lead handling, professional advice, legal obligations, security investigations, or a business transfer.",
          "Provider availability and configuration may change. Tergion Technologies should review provider access, contracts, settings, and retention before enabling a provider for live data.",
        ],
        items: [
          {
            label: "Hosting and security",
            text: "The website is configured for Cloudflare Workers hosting and may use Cloudflare services for deployment, routing, and security.",
          },
          {
            label: "Form protection",
            text: "Cloudflare Turnstile verification may process form-security signals when Turnstile is configured.",
          },
          {
            label: "Lead handling",
            text: "When configured, Resend or Postmark receives the recipient address and confirmation content needed to send a transactional request or assessment confirmation. The selected provider may maintain delivery, bounce, complaint, suppression, and troubleshooting records under its settings and terms.",
          },
          {
            label: "CRM and automation tools",
            text: "GoHighLevel may receive contact details, consent and preference context, attribution details, Quick Request notes, tags, and Automation Assessment Custom Object records when the integration is configured.",
          },
          {
            label: "Professional and legal needs",
            text: "We may disclose information to advisors, service providers, or authorities when reasonably needed for legal, compliance, security, or business purposes.",
          },
        ],
      },
      {
        heading: "Sale and Advertising Disclosures",
        body: [
          "Tergion Technologies does not sell personal information submitted through the Quick Request or Automation Assessment. The inspected website implementation does not share that information for cross-context behavioral advertising and does not enable non-essential advertising cookies.",
          "The website and its providers may use necessary technologies for routing, security, form operation, anti-spam protection, and normal browser functionality. This policy and the Data Notice should be updated before analytics, advertising, chatbot, or additional tracking tools are used publicly.",
        ],
      },
      {
        heading: "Retention",
        body: [
          "Tergion Technologies keeps information only for as long as reasonably necessary and proportionate for the purposes described in this policy. Tergion Technologies does not apply one fixed period to every record; retention is determined by the record type, the status of the inquiry or relationship, consent documentation, provider settings, security needs, and legal, accounting, dispute, or contractual requirements.",
          "When information is no longer reasonably needed, Tergion Technologies may delete it, anonymize or deidentify it, aggregate it, or restrict access. A shorter or longer period may apply when a record supports an active relationship, a legal hold, a dispute, fraud or security investigation, accounting duties, a contract, or documentation of consent or an opt-out.",
        ],
        items: [
          {
            label: "Unresolved Quick Requests and Automation Assessments",
            text: "Kept while the request or assessment remains reasonably relevant for review and follow-up, then subject to periodic review using the criteria above. Quick Requests and assessments may require separate deletion actions because they can exist in different CRM records.",
          },
          {
            label: "Active prospects and converted clients",
            text: "Prospect communications are kept while discussions remain active and for a reasonable period afterward. If a prospect becomes a client, relevant contact, communication, assessment, service, contractual, and accounting records may be retained under the client relationship and any signed agreement.",
          },
          {
            label: "GoHighLevel contacts and Automation Assessment records",
            text: "Contact records, notes, tags, consent context, and separate Automation Assessment Custom Object records are kept while needed for inquiry management, preference-aware follow-up, relationship history, and the other purposes described here. Deleting a contact may not by itself delete every separately stored Custom Object, provider log, suppression, or legally required record.",
          },
          {
            label: "Transactional email and communication records",
            text: "Confirmation content, addresses, delivery events, and provider logs are retained according to the selected email provider's settings and the time reasonably needed for delivery, troubleshooting, security, and recordkeeping. Provider retention should be reviewed when configuration changes.",
          },
          {
            label: "Consent, opt-out, and suppression records",
            text: "Limited records of contact consent, optional SMS choices, policy acknowledgement, opt-outs, bounces, complaints, and suppression decisions may be kept longer than the underlying inquiry when reasonably needed to document and honor communication choices, prevent unwanted contact, or meet legal obligations.",
          },
          {
            label: "Rate limits, duplicate controls, security logs, and provider logs",
            text: "The application's rate-limit and duplicate-control records expire automatically after short operational periods. Security and application logs are generally retained for shorter operational periods under provider settings unless needed to investigate abuse, fraud, a security event, or a legal matter. Exact anti-abuse thresholds are not published.",
          },
          {
            label: "Backups, legal holds, and required records",
            text: "Backup copies and provider recovery copies follow normal backup, restoration, and deletion cycles. Records subject to a legal hold, dispute, fraud investigation, security need, accounting duty, contract, or other legal requirement may be isolated or access-restricted and kept until that need ends.",
          },
        ],
      },
      {
        heading: "Deletion and Privacy Requests",
        body: [
          `You may submit an access, correction, deletion, or communication opt-out request by emailing ${privacyEmail}. Describe the request and the information or interaction it concerns. Tergion Technologies may need to verify your identity or authority before acting and will evaluate the request under applicable law.`,
          "Deletion is not absolute. Legal and contractual exceptions may permit or require retention of limited information for fraud prevention, website and account security, accounting, an active dispute or legal hold, contract performance, consent documentation, opt-out or suppression records, and other obligations permitted by law.",
          "When a deletion request is approved, Tergion Technologies will take reasonable steps appropriate to the relevant systems and providers. Deletion from active systems may not immediately remove information from backups or provider recovery systems. Backup information will remain protected and follow normal retention and restoration cycles; if restored to an active system, it should remain subject to the approved deletion request. Tergion Technologies does not promise selective deletion from an immutable backup when that operation is not technically supported.",
        ],
      },
      {
        heading: "Security",
        body: [
          "We use administrative, technical, and organizational safeguards designed to protect submitted information. These include server-side validation, input length limits, spam checks, conditional Turnstile verification when configured, rate limiting, duplicate checks, safe error responses, and server-side handling of private provider credentials.",
          "No website, network, or provider can be guaranteed to be 100% secure. We limit access to people and providers who need information to support the website, respond to requests, or operate the business.",
        ],
      },
      {
        heading: "Your Communication Choices",
        body: [
          "If marketing emails are sent in the future, they should include an unsubscribe or opt-out method. If SMS is used, you can opt out by replying STOP or by contacting us. Providing a phone number is not automatic consent to SMS marketing.",
        ],
      },
      {
        heading: "California Privacy Note",
        body: [
          "California residents may have privacy rights under applicable California law, including rights to know, access, correct, delete, and opt out of certain uses of personal information where those laws apply.",
          "Tergion Technologies will evaluate California privacy requests based on applicable law and current business status. We do not currently sell personal information submitted through the request form or use cross-context behavioral advertising in the inspected website implementation.",
          "The categories of information collected and purposes for collection are described in this policy and summarized in the Data Notice.",
        ],
        items: [
          {
            text: "View the short-form Notice at Collection.",
            href: "/data-notice",
            hrefLabel: "Data Notice",
          },
        ],
      },
      {
        heading: "International Users",
        body: [
          "Tergion Technologies operates this website from the United States, and website information and provider records may be processed in the United States or other places where the providers operate.",
          "Website accessibility from another country does not by itself determine which privacy law applies. If applicable law gives you additional nonwaivable rights, Tergion Technologies will evaluate a request under that law. Do not submit information if you are not authorized to transfer it to the United States.",
        ],
      },
      {
        heading: "Children's Privacy",
        body: [
          "This website is intended for business users and is not directed to children under 13. We do not knowingly collect personal information from children under 13. Contact the Privacy Contact if you believe a child submitted information so the situation can be reviewed.",
        ],
      },
      {
        heading: "Third-Party Links and Services",
        body: [
          "The website may link to third-party sites or use third-party service providers. We are not responsible for third-party privacy practices, terms, or security.",
        ],
        items: [
          {
            text: "Review the current provider and service category summary.",
            href: "/third-party-notices",
            hrefLabel: "Third-Party Notices",
          },
        ],
      },
      {
        heading: "Changes",
        body: [
          "We may update this Privacy Policy from time to time. The Last Updated date shows when the current version was posted. Material changes will be posted on the website.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Use",
    effectiveDate,
    lastUpdatedDate: formLegalLastUpdatedDate,
    intro: `These Terms of Use govern access to and use of tergion.com and website request interactions with ${companyName}.`,
    contact: defaultContact,
    sections: [
      {
        heading: "Website Use and No Client Relationship",
        body: [
          "By using this website or submitting a request, you agree to these Terms of Use. If you do not agree, do not use the website or submit information through the request form.",
          `${companyName} provides information about B2B CRM implementation, workflow automation, AI-assisted operations, lead follow-up systems, customer communication systems, business systems, and related operational technology services.`,
          "The website is informational. Website access, a form submission, an assessment, a reply, or preliminary discussion does not create a client, professional, fiduciary, confidential, or services relationship and does not obligate Tergion Technologies to accept or perform work.",
          "Paid professional services require a separate written agreement signed or otherwise formally accepted by the applicable parties. A Master Services Agreement, Statement of Work, subscription agreement, or other signed client contract may establish different service, risk, privacy, liability, indemnity, and dispute terms and will control for the services it covers if it conflicts with these Website Terms.",
        ],
      },
      {
        heading: "Requests, Assessments, and User Submissions",
        body: [
          "Quick Requests and Automation Assessments are provided to help Tergion Technologies understand an inquiry and identify possible business-system or automation opportunities. They are not secure file-transfer tools and are not intended for customer datasets, credentials, regulated data, or another party's confidential materials.",
          "Submitting a request does not guarantee a meeting, proposal, service availability, result, appointment, or client relationship. Tergion Technologies may contact you based on your preferences and consent.",
          "SMS consent is optional and separate. Providing a phone number or selecting phone as a preferred contact method is not automatic consent to SMS marketing.",
          "You retain responsibility for information, content, instructions, materials, and data you supply. Tergion Technologies may use a submission only for the limited purposes described in the Privacy Policy and Data Notice and does not assume that you have authority merely because a form accepted the submission.",
        ],
      },
      {
        heading: "User Representations and Authority",
        body: [
          "You represent that information you submit is accurate in all material respects, that you are authorized to act for the person or business identified, and that you have obtained the rights, notices, permissions, and consents necessary for Tergion Technologies to receive and use the submission for the disclosed purposes.",
          "Do not submit another person's personal information, customer data, another company's confidential process information, or protected materials unless the submission is necessary for a lawful request and you have authority to provide it. You are responsible for user-supplied instructions and materials and for evaluating whether a requested workflow, message, outreach practice, scraping activity, review process, or data use is lawful.",
          "Tergion Technologies will not knowingly perform an unlawful instruction merely because a user accepts responsibility. It may ask for proof of authority or refuse a request.",
        ],
      },
      {
        heading: "Prohibited Conduct",
        body: [
          "You may not misuse the website, forms, examples, recommendations, or communications.",
        ],
        items: [
          {
            text: "Do not submit illegal, fraudulent, deceptive, abusive, defamatory, or materially false information, including information that could cause a dispute with another person or business.",
          },
          {
            text: "Do not submit passwords, customer lists or records, financial account or payment-card details, health information, regulated data, or another person's personal information or another company's confidential process information without authorization.",
          },
          {
            text: "Do not upload or transmit text, logos, images, trademarks, marketing materials, software, instructions, or other content that infringes or violates intellectual-property, privacy, publicity, confidentiality, contractual, or other third-party rights.",
          },
          {
            text: "Do not request or use the website to support unlawful outreach, scraping, messaging, review manipulation, surveillance, discrimination, or data-processing practices, and do not misuse an example, recommendation, or workflow contrary to law.",
          },
          {
            text: "Do not attempt unauthorized access, probing, circumvention, interference, malicious-code delivery, abusive automation, scraping of the website, impersonation, or spam submissions.",
          },
        ],
      },
      {
        heading: "No Guaranteed Outcomes",
        body: [
          "Tergion Technologies does not guarantee revenue growth, lead growth, review improvement, search rankings, deliverability, uptime, compliance outcomes, AI accuracy, or specific business results.",
          "Services and examples described on the website are designed to improve organization, follow-up, visibility, workflow consistency, and operational control, but actual results depend on many factors outside the website's control.",
          "Website content is not legal, financial, tax, compliance, marketing, security, or other professional advice. Consult qualified professionals for advice specific to your business, industry, and obligations.",
        ],
      },
      {
        heading: "AI-Assisted Tools and Limitations",
        body: [
          "AI-assisted tools may support planning, composing, summarizing, routing, and workflow ideation. AI outputs can be inaccurate, incomplete, or outdated.",
          "Human review is required before relying on AI-assisted output for client recommendations, implementations, messages, claims, compliance decisions, or operational changes. You remain responsible for approving workflows, messages, claims, and business practices used by your organization.",
        ],
      },
      {
        heading: "Intellectual Property",
        body: [
          "Website content, branding, copy, design, code, graphics, workflows, examples, and materials are owned by Tergion Technologies or its licensors unless otherwise stated.",
          "You may view the website for normal business evaluation purposes. You may not copy, reuse, sell, publish, or create derivative works from website materials except as allowed by law or with written permission.",
          "Nothing on the website grants a trademark registration claim, open-source license for proprietary site content, or ownership interest in Tergion Technologies materials.",
        ],
      },
      {
        heading: "Third-Party Services",
        body: [
          "The website may use third-party providers for hosting, security, communications, lead handling, and business operations. Third-party services have their own terms and privacy practices.",
          "GoHighLevel, email providers, Cloudflare, Upstash, CRM platforms, and other providers may impose additional terms or availability limits. Tergion Technologies does not control third-party systems and is not responsible for their independent acts, content, terms, or privacy practices, subject to rights and liabilities that cannot legally be excluded.",
        ],
      },
      {
        heading: "Communications",
        body: [
          "Tergion Technologies may follow up by email, phone, or text based on your request, preferences, and consent. Optional SMS consent is separate from the required request-form consent.",
          "If marketing emails are sent later, they should include an opt-out method. If SMS is used, you can opt out by replying STOP or by contacting Tergion Technologies.",
        ],
      },
      {
        heading: "Disclaimer of Warranties",
        body: [
          "The website is provided as is and as available. To the maximum extent permitted by applicable law, Tergion Technologies disclaims warranties of any kind, whether express, implied, or statutory, including implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.",
          "We do not warrant that the website will be uninterrupted, error-free, secure, or available at all times.",
          "Nothing in this section excludes a warranty or statutory right that cannot legally be excluded.",
        ],
      },
      {
        heading: "Limitation of Liability",
        body: [
          "To the maximum extent permitted by applicable law, Tergion Technologies and its owners, officers, employees, contractors, and agents will not be liable for indirect, incidental, consequential, special, exemplary, or punitive damages arising out of or relating to the website, a request or assessment, website content, or these Website Terms. This exclusion includes lost profits, lost revenue, lost data, loss of goodwill, reputational harm, business interruption, and the cost of replacement products or services, even if the possibility of such damages was disclosed.",
          "The website is generally provided without charge. These Website Terms therefore do not use a fees-paid-during-the-previous-12-months aggregate cap or invent a fixed dollar cap for free website use. Any aggregate or fee-based liability cap for paid professional services must be established in an applicable Master Services Agreement, Statement of Work, subscription agreement, or other signed client contract, and that agreement controls for the services it covers.",
          "These exclusions do not apply to fraud, willful misconduct, gross negligence to the extent it cannot legally be limited, statutory rights that cannot be waived, or any other liability that applicable law prohibits limiting. If a jurisdiction does not permit a particular exclusion or limitation, that exclusion or limitation applies only to the maximum extent permitted by applicable law, and the remaining provisions remain in effect.",
          "This section allocates risk but does not prevent a person from filing a claim or guarantee that a court will enforce every limitation.",
        ],
      },
      {
        heading: "Indemnification",
        body: [
          "To the maximum extent permitted by applicable law, you agree to defend, indemnify, and hold harmless Tergion Technologies and its owners, officers, employees, contractors, and agents from third-party claims, demands, proceedings, liabilities, losses, judgments, damages, costs, and reasonable attorneys' fees to the extent arising out of or relating to your material breach of these Terms; unlawful use of the website; misuse of a form, example, recommendation, or service; fraudulent, deceptive, or materially false submission; unauthorized access attempt; submission of information without authority; submission of another person's personal information or another company's confidential information without authorization; infringement or violation of intellectual-property, privacy, publicity, confidentiality, contractual, or other third-party rights; violation of applicable law caused by your conduct; or content, instructions, materials, or data you supply.",
          "This obligation does not apply to Tergion Technologies' fraud, willful misconduct, material breach of these Terms, liability that cannot legally be shifted, or a claim caused solely by Tergion Technologies' unlawful conduct.",
          "Tergion Technologies will provide reasonably prompt notice after learning of a covered claim. A delay in notice reduces your obligations only to the extent the delay materially prejudices the defense. You will provide reasonable cooperation. You may control the defense with counsel reasonably acceptable to Tergion Technologies, and Tergion Technologies may participate with separate counsel at its own expense unless a conflict of interest or a covered failure to defend reasonably requires otherwise.",
          "You may not settle a covered claim without Tergion Technologies' prior written consent if the settlement admits wrongdoing by Tergion Technologies, imposes a payment or nonmonetary obligation on Tergion Technologies, restricts its operations, or does not provide an unconditional release of the covered parties. Consent will not be unreasonably withheld for a settlement that fully satisfies these conditions.",
          "A signed client agreement may contain separate, more specific indemnity and defense provisions and will control for the paid services it covers.",
        ],
      },
      {
        heading: "Governing Law and Dispute Resolution",
        body: [
          `These Website Terms and disputes arising from them are governed by the laws of ${jurisdiction}, excluding its conflict-of-laws rules, except to the extent federal law or another nonwaivable law applies.`,
          `Before starting a formal court proceeding, please send a description of the issue and requested resolution to ${contactEmail} so the parties have a reasonable opportunity to review it informally. This requested informal process does not prevent or delay a small-claims filing, a request for emergency or injunctive relief, a statutory complaint, a regulatory report, or any claim for which a pre-suit process cannot lawfully be required.`,
          "A permitted court proceeding may be filed in a state or federal court located in Washington that has subject-matter jurisdiction and is a proper venue under applicable law. You consent to personal jurisdiction in Washington only to the extent that consent is valid and permitted under applicable law. These Terms do not require an exclusive Washington county and preserve any forum or jurisdictional right that cannot legally be waived.",
          "These Website Terms do not require binding arbitration, waive a jury trial, impose a class-action waiver, or shorten an applicable limitations period.",
        ],
      },
      {
        heading: "Suspension or Termination",
        body: [
          "Tergion Technologies may refuse, suspend, or terminate website access, a request, assessment review, communication, or proposed work when it reasonably suspects illegality, abuse, fraud, infringement, unauthorized data, security interference, or a violation of these Terms.",
          "Tergion Technologies may preserve relevant records and report conduct when reasonably necessary to protect rights or security or comply with law. Suspension or termination does not require Tergion Technologies to perform a user instruction that it believes may be unlawful.",
        ],
      },
      {
        heading: "Severability",
        body: [
          "If a court with authority finds a provision of these Terms unlawful or unenforceable, that provision will be enforced to the maximum extent permitted or severed to the minimum extent necessary, and the remaining provisions will remain in effect.",
        ],
      },
      {
        heading: "Waiver",
        body: [
          "A failure or delay in enforcing a provision is not a waiver of that provision or any other right. A waiver must be clear and applies only to the specific instance for which it is given.",
        ],
      },
      {
        heading: "Assignment",
        body: [
          "You may not assign or transfer your rights or obligations under these Website Terms without Tergion Technologies' prior written consent. Tergion Technologies may assign these Terms in connection with a merger, reorganization, sale of assets, or transfer of the website or business, subject to applicable law.",
        ],
      },
      {
        heading: "Changes to the Terms",
        body: [
          "We may update these Terms of Use from time to time. The Last Updated date identifies the current version posted on the website. Changes apply prospectively when posted unless a later date is stated, and material changes should receive additional notice when applicable law requires it.",
        ],
      },
      {
        heading: "Entire Agreement for Website Use",
        body: [
          "These Terms, together with the Privacy Policy, Data Notice, AI Disclosure, and any other policy expressly incorporated into them, are the entire agreement governing free public website use and website request interactions. They do not replace or amend a signed client agreement, and a signed client agreement controls for the paid services it covers.",
        ],
      },
    ],
  },
  "ai-disclosure": {
    title: "AI Disclosure",
    effectiveDate,
    lastUpdatedDate,
    intro: `${companyName} may use AI-assisted tools to support business systems planning, workflow design, internal review, and implementation preparation. This page explains that use in plain English.`,
    contact: defaultContact,
    sections: [
      {
        heading: "How AI May Be Used",
        body: [
          "AI-assisted tools may help develop workflow ideas, organize submitted information, summarize requests, support planning, generate implementation options, and prepare internal notes.",
          "AI may support work involving CRM setup, automation planning, lead follow-up processes, customer communication systems, reporting ideas, and operational documentation.",
        ],
      },
      {
        heading: "Human Review",
        body: [
          "AI-assisted outputs are reviewed before being used for client recommendations or implementations. AI is not a substitute for business judgment, professional review, legal advice, financial advice, security review, or compliance review.",
        ],
      },
      {
        heading: "Limitations",
        body: [
          "AI outputs may be inaccurate, incomplete, outdated, or inappropriate for a specific business situation. Tergion Technologies does not guarantee AI accuracy or business outcomes.",
          "You remain responsible for reviewing and approving business workflows, customer-facing messages, claims, compliance decisions, and operational practices for your organization.",
        ],
      },
      {
        heading: "Information You Submit",
        body: [
          "Do not submit sensitive, regulated, confidential, or third-party information unless it is necessary and you have authority to provide it.",
          "Information submitted through the website may be used to support AI-assisted organization, planning, and internal review as described in the Privacy Policy.",
        ],
      },
      {
        heading: "Future AI Features",
        body: [
          "If a chatbot, self-service AI feature, or other user-facing AI tool is added later, it should be clearly identified as AI-assisted and covered in the Privacy Policy before public use.",
        ],
      },
    ],
  },
  "data-notice": {
    title: "Data Notice",
    effectiveDate,
    lastUpdatedDate: formLegalLastUpdatedDate,
    intro: "This notice applies at collection to the Quick Request and Automation Assessment. It summarizes what is collected, why, the principal provider categories, the retention approach, and available choices. The full Privacy Policy provides more detail.",
    contact: {
      label: "Privacy Contact",
      email: privacyEmail,
    },
    sections: [
      {
        heading: "What We Collect",
        items: [
          {
            label: "Contact identifiers",
            text: "First name, optional last name, business name, email, and phone when provided or required by contact preference.",
          },
          {
            label: "Business and request information",
            text: "Website, industry, business size, service area, CRM use, current CRM, automation interests, priority, scheduling preference, approximate lead volume, approximate customer value, inquiry handling, call handling, missed-call practices, response-time practices, quote follow-up, pipeline visibility, tracking method, operational challenge, optional assessment notes, and related context you choose to provide.",
          },
          {
            label: "Contact preferences and consent records",
            text: "Preferred contact method, scheduling preference, assessment follow-up preference, contact consent, privacy and terms acknowledgement, optional SMS consent, and AI disclosure indicator.",
          },
          {
            label: "Technical and security data",
            text: "Referrer, landing page, timezone, UTM parameters if present, completion timing, honeypot signals, limited or hashed rate-limit and duplicate-control signals, and Turnstile verification results when configured.",
          },
          {
            label: "Communications",
            text: "Messages and emails sent to or from Tergion Technologies about your request.",
          },
        ],
      },
      {
        heading: "Why We Collect It",
        items: [
          {
            label: "Quick Request information",
            text: "To receive and respond to the inquiry, understand the business context, manage a prospective-client record, assign follow-up, send a transactional confirmation when configured, and communicate according to the selected contact and scheduling preferences.",
          },
          {
            label: "Automation Assessment answers",
            text: "To review the assessment, identify possible workflow and automation opportunities, prepare response or planning notes, create and manage related GoHighLevel contact and Assessment records when configured, and honor the selected follow-up preference.",
          },
          {
            label: "Consent and communication preferences",
            text: "To document contact authorization, policy acknowledgement, optional SMS choice, assessment follow-up choice, scheduling preference, and later opt-out or suppression instructions.",
          },
          {
            label: "Technical, attribution, and security data",
            text: "To operate and protect the website, validate submissions, prevent spam, abuse, fraud, and repeated submissions, investigate security or delivery events, diagnose failures, and understand how a request reached the form.",
          },
          {
            label: "Communications",
            text: "To respond, preserve relevant conversation history, troubleshoot confirmations, manage follow-up, and document corrections, consent changes, or opt-outs.",
          },
        ],
        body: [
          "Information may also be used in a limited form to comply with law, protect the website and Tergion Technologies, resolve disputes, investigate fraud or security events, and improve Tergion processes and services. A materially different use will receive an updated notice or consent when required.",
          "Do not submit passwords, customer lists or records, financial account or payment-card details, health information, regulated data, or another party's personal or confidential information through the website forms.",
        ],
      },
      {
        heading: "Principal Provider Categories",
        body: [
          "Information may be disclosed as needed to hosting and website-security providers, Cloudflare Turnstile when configured, Upstash for limited anti-abuse controls when configured, GoHighLevel for contact and assessment record management when configured, Resend or Postmark for transactional confirmation email when configured, and professional advisors or authorities when reasonably necessary for legal, security, or business-continuity purposes.",
          "Google Sheets, analytics, advertising, chatbot, and marketing-email integrations are not active in the current website implementation.",
        ],
      },
      {
        heading: "Sale or Sharing for Advertising",
        body: [
          "Tergion Technologies does not sell personal information submitted through the request form. The current website implementation does not use cross-context behavioral advertising.",
        ],
      },
      {
        heading: "How Long We Keep It",
        body: [
          "Information is retained only as long as reasonably necessary and proportionate for inquiry or assessment review, prospective-client follow-up, communications, security, consent documentation, legal obligations, disputes, and recordkeeping. The period depends on the record type, whether a conversation or client relationship remains active, provider settings, and legal, accounting, security, contractual, or opt-out needs.",
          "Rate-limit and duplicate-control data expires after short operational periods. CRM contact and separate Assessment records require record-specific review and deletion. Transactional email and provider logs follow provider settings. Backups and recovery copies follow normal provider retention and restoration cycles. Tergion Technologies may delete, anonymize, deidentify, aggregate, or restrict access to information when it is no longer needed.",
        ],
      },
      {
        heading: "Your Choices and Contact",
        body: [
          `Email ${privacyEmail} to request access, correction, deletion, or an opt-out from follow-up. Tergion Technologies may need to verify your identity or authority and will evaluate the request under applicable law. Legal, contractual, fraud, security, accounting, dispute, consent, opt-out, and backup exceptions may apply.`,
        ],
        items: [
          {
            text: "Read the full policy.",
            href: "/privacy",
            hrefLabel: "Privacy Policy",
          },
        ],
      },
    ],
  },
  "third-party-notices": {
    title: "Third-Party Notices",
    effectiveDate,
    lastUpdatedDate,
    intro: "This notice describes third-party services and provider categories that may support the Tergion Technologies website, request forms, security, lead handling, and business operations.",
    contact: defaultContact,
    sections: [
      {
        heading: "Hosting, DNS, and security",
        body: [
          "Tergion Technologies uses Cloudflare to host, route, secure, and operate portions of the website and related infrastructure.",
        ],
      },
      {
        heading: "Bot and spam protection",
        body: [
          "Tergion Technologies uses Cloudflare Turnstile and related security controls to help protect request forms from spam, automated abuse, and suspicious activity.",
        ],
      },
      {
        heading: "CRM and lead management",
        body: [
          "Tergion Technologies may use a CRM and automation platform, including GoHighLevel/HighLevel where configured, to manage website inquiries, contact records, follow-up notes, tags, and related business operations.",
        ],
      },
      {
        heading: "Abuse prevention and rate limiting",
        body: [
          "Tergion Technologies may use infrastructure providers such as Upstash Redis to support rate limiting, duplicate request prevention, and abuse detection for website forms.",
        ],
      },
      {
        heading: "Communications providers",
        body: [
          "Tergion Technologies may use email, messaging, or business communication providers to respond to inquiries and manage business communications. Communication practices are also described in the Privacy Policy and Terms of Use.",
        ],
      },
      {
        heading: "Open-source website packages",
        body: [
          "The website uses open-source software packages such as Next.js, React, TypeScript, Tailwind, Zod, React Hook Form, and related tooling. Package licenses govern those packages only. This notice does not grant rights to copy Tergion Technologies' proprietary website content, branding, design, or implementation materials.",
        ],
      },
      {
        heading: "Updates",
        body: [
          "Tergion Technologies may update this notice if provider relationships, website operations, or service categories change.",
        ],
      },
    ],
  },
  accessibility: {
    title: "Accessibility Statement",
    effectiveDate,
    lastUpdatedDate,
    intro: `${companyName} aims to make the website accessible and usable for visitors, including people who use assistive technologies.`,
    contact: defaultContact,
    sections: [
      {
        heading: "Accessibility Approach",
        body: [
          "The site is built with accessibility practices in mind, including semantic HTML, keyboard navigation, visible focus states, labeled form controls, readable contrast, responsive layouts, and reduced-motion support where practical.",
          "Accessibility is an ongoing effort. The website may not work perfectly for every user, device, browser, or assistive technology combination.",
        ],
      },
      {
        heading: "Reporting an Issue",
        body: [
          `If you experience an accessibility issue, contact ${contactEmail}. Helpful details include the page URL, a short description of the issue, what you were trying to do, and the browser, device, or assistive technology you used if you want to provide that information.`,
          "Tergion Technologies will review reported issues and make reasonable improvements where practical.",
        ],
      },
      {
        heading: "No Formal Audit Claim",
        body: [
          "This statement describes current intent and practices. It does not claim independent accessibility certification, full WCAG conformance, or ADA compliance.",
        ],
      },
    ],
  },
};
