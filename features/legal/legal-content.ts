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
const formLegalLastUpdatedDate = "July 22, 2026";
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
          "This policy applies to tergion.com and the website request or contact interactions controlled by Tergion Technologies.",
          "It does not govern third-party websites, client systems, CRM accounts, automation platforms, or other services that Tergion Technologies does not control. Future client agreements may include additional privacy, security, and service terms.",
        ],
      },
      {
        heading: "Information We Collect",
        body: [
          "We collect information you submit through the Quick Request, Business Automation Assessment, and related communications. The Quick Request requires first name, business name, email, preferred contact method, scheduling preference, contact consent, and privacy and terms acknowledgement. Phone is required only when phone or text is selected as the preferred contact method.",
          "The Business Automation Assessment collects first name, optional last name, business name, email, phone, preferred contact method, industry, approximate monthly lead volume, optional approximate customer value, website or message inquiry handling, incoming-call ownership, missed-call practices, lead response-time practices, optional quote follow-up practices, optional pipeline visibility, optional lead and customer tracking method, operational challenge, follow-up preference, and optional assessment notes.",
          "Other optional Quick Request information may include last name, phone, website, industry, business size, location or service area, whether the business uses a CRM, current CRM, automation interests, request priority, notes, and other business context you choose to provide.",
          "We also collect consent records, including contact consent, privacy and terms acknowledgement, optional SMS consent, and an AI disclosure indicator used by the form.",
          "Technical and security information may include browser or device metadata, request metadata, referrer, landing page, timezone, UTM parameters if present, completion timing, honeypot signals, rate-limit and duplicate-check signals, and Cloudflare Turnstile verification results when Turnstile is configured.",
          "Communications with Tergion Technologies, including emails or messages sent to or from us, may also be retained as part of responding to a request.",
          "Please do not submit passwords, customer records, financial account details, payment card details, health information, regulated data, or confidential third-party information through either form.",
        ],
      },
      {
        heading: "How We Use Information",
        items: [
          {
            label: "Responding to requests",
            text: "We use submitted information to review requests, honor the assessment follow-up preference you select, contact you based on your preferences and consent, answer questions, and schedule follow-up when appropriate.",
          },
          {
            label: "Planning services",
            text: "We use business context to evaluate CRM, automation, AI-assisted workflow, lead follow-up, communication, and business systems needs.",
          },
          {
            label: "Operating the website",
            text: "We use technical and security information to operate the site, validate submissions, prevent spam or abuse, reduce duplicate submissions, maintain records, improve services, and protect the website.",
          },
          {
            label: "Legal and operational needs",
            text: "We may use information to comply with legal obligations, enforce terms, protect rights and security, and maintain business records.",
          },
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
        heading: "How We Share Information",
        body: [
          "We do not sell personal information submitted through the website request form.",
          "We may share information with service providers only as needed to support hosting, website security, communications, lead handling, business operations, professional advice, legal obligations, security investigations, or a business transfer.",
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
            text: "When configured, the selected email provider receives the recipient address and confirmation content needed to confirm a website request or assessment. Lead information may also be sent to the configured CRM for contact management, request notes, tags, and preference-aware follow-up handling.",
          },
          {
            label: "CRM and automation tools",
            text: "GoHighLevel may receive website lead contact details, consent context, attribution details, and request notes when the GoHighLevel integration is configured. Other CRM and automation platforms may be used for future client work or lead handling if configured.",
          },
          {
            label: "Professional and legal needs",
            text: "We may disclose information to advisors, service providers, or authorities when reasonably needed for legal, compliance, security, or business purposes.",
          },
        ],
      },
      {
        heading: "Cookies and Similar Technologies",
        body: [
          "The current website code does not enable non-essential analytics scripts, advertising cookies, or cross-context behavioral advertising.",
          "The website and its providers may use necessary technologies for routing, security, form operation, anti-spam protection, and normal browser functionality. If analytics, advertising, chatbot, or additional tracking tools are added later, this policy and related notices should be updated before those tools are used publicly.",
        ],
      },
      {
        heading: "Retention",
        body: [
          "We keep request and lead information only as long as reasonably needed for follow-up, operations, security, legal, and recordkeeping purposes.",
          "As a working default, unresolved website lead records should not be retained longer than 24 months unless a client relationship, legal need, active conversation, security need, or deletion request changes that period.",
          "Security signals should be kept for shorter periods when practical. The current in-memory rate-limit and duplicate-check mechanisms are temporary operational controls, not long-term storage systems.",
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
        heading: "Your Choices and Rights",
        body: [
          `You may contact ${privacyEmail} to request access, correction, deletion, or an opt-out from follow-up communications. We may need to verify your identity and evaluate the request based on applicable law, security needs, legal obligations, and current business records.`,
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
        heading: "Children",
        body: [
          "This website is intended for business users and is not directed to children under 13. We do not knowingly collect personal information from children under 13.",
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
        heading: "Acceptance of Terms",
        body: [
          "By using this website or submitting a request, you agree to these Terms of Use. If you do not agree, do not use the website or submit information through the request form.",
        ],
      },
      {
        heading: "Website Purpose",
        body: [
          `${companyName} provides information about B2B CRM implementation, workflow automation, AI-assisted operations, lead follow-up systems, customer communication systems, business systems, and related operational technology services.`,
          "The website is informational and does not itself create a client relationship, services agreement, fiduciary relationship, or obligation to provide services.",
        ],
      },
      {
        heading: "Request Forms and Communications",
        body: [
          "If you submit a request, you agree that the information you provide is accurate and that you are authorized to submit it.",
          "Submitting a request does not guarantee a meeting, proposal, service availability, result, appointment, or client relationship. Tergion Technologies may contact you based on your preferences and consent.",
          "SMS consent is optional and separate. Providing a phone number or selecting phone as a preferred contact method is not automatic consent to SMS marketing.",
        ],
      },
      {
        heading: "No Guaranteed Outcomes",
        body: [
          "Tergion Technologies does not guarantee revenue growth, lead growth, review improvement, search rankings, deliverability, uptime, compliance outcomes, AI accuracy, or specific business results.",
          "Services and examples described on the website are designed to improve organization, follow-up, visibility, workflow consistency, and operational control, but actual results depend on many factors outside the website's control.",
        ],
      },
      {
        heading: "No Professional Advice",
        body: [
          "Website content is not legal, financial, tax, compliance, marketing, security, or other professional advice. You should consult qualified professionals for advice specific to your business, industry, and obligations.",
        ],
      },
      {
        heading: "AI-Related Limitations",
        body: [
          "AI-assisted tools may support planning, composing, summarizing, routing, and workflow ideation. AI outputs can be inaccurate, incomplete, or outdated.",
          "Human review is required before relying on AI-assisted output for client recommendations, implementations, messages, claims, compliance decisions, or operational changes. You remain responsible for approving workflows, messages, claims, and business practices used by your organization.",
        ],
      },
      {
        heading: "Acceptable Use",
        body: [
          "You may not misuse the website or request form.",
        ],
        items: [
          {
            text: "Do not submit illegal, fraudulent, abusive, or misleading content.",
          },
          {
            text: "Do not submit passwords, customer records, financial account details, payment card details, health information, regulated data, or confidential third-party information through the website forms.",
          },
          {
            text: "Do not submit information on behalf of another person or business without authority.",
          },
          {
            text: "Do not upload or transmit malicious code, attempt unauthorized access, scrape or automate abusive traffic, interfere with site security, impersonate others, or submit spam requests.",
          },
        ],
      },
      {
        heading: "User-Submitted Information",
        body: [
          "You grant Tergion Technologies permission to use information you submit as needed to respond to your request, evaluate business systems needs, prepare planning materials, operate the website, prevent abuse, and maintain records.",
          "You represent that you have the rights and authority needed to submit the information and to allow Tergion Technologies to use it for those limited purposes.",
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
          "GoHighLevel, CRM platforms, email providers, analytics tools, or other providers may have additional terms when used for website lead handling, client work, or live integrations.",
        ],
      },
      {
        heading: "Reviews and Testimonials",
        body: [
          "If reviews, testimonials, or public client feedback are shown later, they should be genuine, authorized, and not fake, purchased, coerced, or misleading.",
          "Tergion Technologies does not guarantee review outcomes or review-platform results.",
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
        heading: "Disclaimers",
        body: [
          "The website is provided as is and as available. To the maximum extent allowed by law, Tergion Technologies disclaims warranties of any kind, whether express, implied, or statutory, including implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.",
          "We do not warrant that the website will be uninterrupted, error-free, secure, or available at all times.",
        ],
      },
      {
        heading: "Limitation of Liability",
        body: [
          "To the maximum extent allowed by law, Tergion Technologies will not be liable for indirect, incidental, consequential, special, exemplary, or punitive damages arising from your use of the website or request form.",
          "Some jurisdictions do not allow certain limitations. In those cases, the limitation applies only to the extent allowed by applicable law.",
        ],
      },
      {
        heading: "Indemnity",
        body: [
          "You agree to defend, indemnify, and hold Tergion Technologies harmless from claims, damages, liabilities, costs, and expenses arising from your misuse of the website, unauthorized submissions, violation of these terms, violation of law, or infringement of another person's rights.",
        ],
      },
      {
        heading: "Governing Law and Informal Resolution",
        body: [
          `These terms are governed by the laws of ${jurisdiction}, without regard to conflict-of-law rules.`,
          `Before starting a formal dispute, please contact ${contactEmail} so the issue can be reviewed informally. These terms do not add a binding arbitration clause or class-action waiver.`,
        ],
      },
      {
        heading: "Changes",
        body: [
          "We may update these Terms of Use from time to time. The Last Updated date controls the current version posted on the website.",
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
    intro: "This short notice summarizes what the website request form collects and why. The full Privacy Policy provides more detail.",
    contact: {
      label: "Privacy Contact",
      email: privacyEmail,
    },
    sections: [
      {
        heading: "Categories Collected",
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
            text: "Referrer, landing page, timezone, UTM parameters if present, completion timing, honeypot signals, rate-limit and duplicate-check signals, and Turnstile verification result when configured.",
          },
          {
            label: "Communications",
            text: "Messages and emails sent to or from Tergion Technologies about your request.",
          },
        ],
      },
      {
        heading: "Purposes",
        body: [
          "We collect this information to respond to your request, evaluate automation, CRM, and business systems needs, honor the assessment follow-up preference you select, schedule follow-up when appropriate, prevent spam or abuse, secure the site, improve services, and maintain appropriate records.",
          "Do not submit passwords, customer records, financial account details, payment card details, health information, regulated data, or confidential third-party information through the website forms.",
        ],
      },
      {
        heading: "Sharing",
        body: [
          "Information may be shared with service providers such as hosting, security, email, Google Workspace or Google Sheets if enabled, CRM or automation tools if enabled, and professional advisors when needed for website operations, communications, lead handling, security, and business operations.",
        ],
      },
      {
        heading: "Sale or Sharing for Advertising",
        body: [
          "Tergion Technologies does not sell personal information submitted through the request form. The current website implementation does not use cross-context behavioral advertising.",
        ],
      },
      {
        heading: "Retention",
        body: [
          "Information is retained as reasonably needed for follow-up, operations, security, legal, and recordkeeping purposes. As a working default, unresolved website lead records should not be retained longer than 24 months unless a client relationship, legal need, active conversation, security need, or deletion request changes that period.",
        ],
      },
      {
        heading: "Choices",
        body: [
          `Contact ${privacyEmail} to request access, correction, deletion, or opt-out from follow-up. Requests may require identity verification and will be evaluated under applicable law.`,
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
