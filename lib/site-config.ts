const clientLoginUrl = process.env.NEXT_PUBLIC_GHL_LOGIN_URL ?? "";

export const siteConfig = {
  name: "Tergion Technologies",
  companyName: "Tergion Technologies",
  publicBrandName: "Tergion Technologies",
  shortName: "Tergion",
  description:
    "AI-powered CRM, automation, and business systems for growing companies.",
  domain: "https://tergion.com",
  contactEmail: "contact@tergion.com",
  privacyEmail: "contact@tergion.com",
  supportEmail: "contact@tergion.com",
  emailLogoPath: "/logos/tergion_logo_blue_text.png",
  transactionalEmail: {
    from: "Tergion Technologies <notifications@tergion.com>",
    replyTo: "noreply@tergion.com",
  },
  jurisdiction: "Washington, United States",
  policyEffectiveDate: "July 6, 2026",
  policyLastUpdatedDate: "July 16, 2026",
  legalEntityName: "",
  mailingAddress: "",
  physicalAddress: "",
  registeredAgentAddress: "",
  clientLoginUrl,
  analyticsProvider: "",
  emailProvider: "",
  hostingProvider: "Cloudflare Workers",
  cloudflareTurnstileEnabled: false,
  googleSheetsEnabled: false,
  goHighLevelEnabled: false,
  smsEnabled: false,
  marketingEmailEnabled: false,
  chatbotEnabled: false,
  cta: {
    primary: "Request a free automation review",
    secondary: "See example automations",
    nav: "Start when ready",
    contactPage: "Start with the basics",
    workflow: "Ask about this workflow",
    viewExample: "View example",
    final: "Request review when ready",
    footer: "Contact Tergion",
    footerRequest: "Request an automation review",
  },
  navLinks: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Examples", href: "/examples" },
    { label: "Process", href: "/process" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  legalLinks: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "AI Disclosure", href: "/ai-disclosure" },
    { label: "Data Notice", href: "/data-notice" },
    { label: "Third-Party Notices", href: "/third-party-notices" },
    { label: "Accessibility", href: "/accessibility" },
  ],
  ghlLoginUrl: clientLoginUrl,
  socialLinks: [] as Array<{ label: string; href: string }>,
} as const;

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || siteConfig.domain;
}
