export const siteConfig = {
  name: "Tergion Technologies",
  shortName: "Tergion",
  description:
    "AI-powered CRM, automation, and business systems for growing companies.",
  domain: "https://tergiontechnologies.com",
  contactEmail: "hello@tergiontechnologies.com",
  cta: {
    primary: "Request a free automation review",
    start: "Start the request",
    secondary: "See example automations",
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
  ghlLoginUrl: process.env.NEXT_PUBLIC_GHL_LOGIN_URL ?? "",
  socialLinks: [] as Array<{ label: string; href: string }>,
} as const;

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || siteConfig.domain;
}
