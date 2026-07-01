export type LegalPageContent = {
  title: string;
  effectiveNote: string;
  intro: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

const draftNote =
  "Draft template for Phase 1A. This page requires attorney review before public launch.";

export const legalPages: Record<string, LegalPageContent> = {
  privacy: {
    title: "Privacy Policy",
    effectiveNote: draftNote,
    intro:
      "This draft explains how Tergion Technologies expects to handle website and request-form information. It should be reviewed before the site is used publicly.",
    sections: [
      {
        heading: "Information We Collect",
        body: [
          "We may collect contact/request form information, optional business context, scheduling preferences, website usage data, and spam or security signals submitted through the site.",
          "Optional business information may include industry, business size, service area, current CRM, lead volume, automation interests, timeline, and notes.",
        ],
      },
      {
        heading: "How We Use Information",
        body: [
          "We use submitted information to respond to requests, evaluate automation needs, prevent spam, improve services, and prepare business systems recommendations.",
          "Tergion Technologies may use AI-assisted tools to help organize information and support automation planning. AI-assisted outputs are reviewed before being used for client recommendations or implementations.",
        ],
      },
      {
        heading: "Providers and Subprocessors",
        body: [
          "The site may use hosting providers, Google Workspace or Google Sheets, an email provider, Cloudflare Turnstile, analytics tools if enabled, and GoHighLevel if integrated later.",
          "Provider names and processing details must be finalized before public launch.",
        ],
      },
      {
        heading: "Retention, Rights, and Contact",
        body: [
          "Data retention periods and user rights procedures are placeholders until the production operating process is approved.",
          "Privacy requests should be directed to hello@tergiontechnologies.com unless a different contact is approved.",
        ],
      },
      {
        heading: "California, Children, and Security",
        body: [
          "California privacy obligations, GDPR applicability, and other jurisdiction-specific requirements require legal review.",
          "This website is not intended for children. Security practices include server-side validation, spam prevention, and credential handling controls, but no website or provider can guarantee absolute security.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Use",
    effectiveNote: draftNote,
    intro:
      "These draft terms describe expected website use and limitations. They are not final legal terms until reviewed by counsel.",
    sections: [
      {
        heading: "Website Use",
        body: [
          "The website provides general information about Tergion Technologies and allows visitors to submit a request for review.",
          "Submitting a request does not create a client relationship, confirmed appointment, or obligation to purchase services.",
        ],
      },
      {
        heading: "No Guaranteed Business Results",
        body: [
          "Tergion Technologies does not guarantee revenue increases, lead increases, rankings, reviews, or specific business outcomes.",
          "Systems are designed to improve follow-up speed, organization, visibility, and operational consistency.",
        ],
      },
      {
        heading: "Advice and AI Limitations",
        body: [
          "Website content is not legal, financial, tax, or compliance advice.",
          "AI-assisted tools may support workflow planning, but AI output can be incomplete or inaccurate and does not replace professional review.",
        ],
      },
      {
        heading: "Submissions and Acceptable Use",
        body: [
          "Users are responsible for the accuracy of information they submit.",
          "Visitors may not misuse the site, attempt unauthorized access, submit malicious content, or interfere with normal operation.",
        ],
      },
      {
        heading: "IP, Third Parties, and Disputes",
        body: [
          "Website content and brand materials are owned by Tergion Technologies or their respective licensors.",
          "Third-party services and external links are governed by their own terms.",
          "Limitation of liability, dispute resolution, arbitration, class waiver, and governing law provisions are placeholders requiring attorney review.",
        ],
      },
    ],
  },
  "ai-disclosure": {
    title: "AI Disclosure",
    effectiveNote: "Plain-English disclosure for Phase 1A. Review before launch.",
    intro:
      "Tergion Technologies may use AI-assisted tools to help draft workflows, organize information, and support automation planning. AI-assisted outputs are reviewed before being used for client recommendations or implementations.",
    sections: [
      {
        heading: "Human Review",
        body: [
          "AI tools do not replace professional review, business judgment, or implementation oversight.",
          "Tergion Technologies does not guarantee AI output accuracy.",
        ],
      },
      {
        heading: "Future AI Features",
        body: [
          "If a chatbot or AI-assisted self-service feature is added later, it should be clearly labeled as AI-assisted.",
        ],
      },
    ],
  },
  "data-notice": {
    title: "Data Notice",
    effectiveNote: "Plain-language notice for form and footer use.",
    intro:
      "We collect the information you submit so we can respond to your request, evaluate your business automation needs, prevent spam, and improve our services.",
    sections: [
      {
        heading: "What This Means",
        body: [
          "The request form asks for basic contact details and optional business context.",
          "Security checks may collect limited technical signals to help prevent spam or abuse.",
        ],
      },
    ],
  },
  "third-party-notices": {
    title: "Third-Party Notices",
    effectiveNote: draftNote,
    intro:
      "This page lists third-party service categories expected for the site. Specific providers must be finalized before launch.",
    sections: [
      {
        heading: "Service Categories",
        body: [
          "Hosting provider placeholder.",
          "Google Workspace / Google Sheets placeholder.",
          "Email provider placeholder.",
          "Cloudflare Turnstile placeholder.",
          "GoHighLevel placeholder if integrated later.",
          "Analytics provider placeholder if analytics are enabled.",
          "Open-source libraries placeholder.",
        ],
      },
    ],
  },
  accessibility: {
    title: "Accessibility Statement",
    effectiveNote: "Accessibility commitment for the Phase 1A website foundation.",
    intro:
      "Tergion Technologies is committed to building an accessible website experience for visitors.",
    sections: [
      {
        heading: "Current Practices",
        body: [
          "This site is being developed with semantic HTML, keyboard navigation, visible focus states, readable contrast, form labels, and reduced motion support.",
          "Accessibility issues can be reported to hello@tergiontechnologies.com until a final accessibility contact process is approved.",
        ],
      },
    ],
  },
};
