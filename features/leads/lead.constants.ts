export const preferredContactMethods = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "text", label: "Text" },
  { value: "no-preference", label: "No preference" },
] as const;

export const automationInterestOptions = [
  "CRM setup",
  "Lead follow-up",
  "Missed calls",
  "Appointment booking",
  "Quote follow-up",
  "Customer reminders",
  "Review requests",
  "Website forms",
  "AI-assisted operations",
  "Reporting and visibility",
] as const;

export const businessSizeOptions = [
  "Solo operator",
  "2-10 team members",
  "11-50 team members",
  "51-200 team members",
  "Not sure",
] as const;

export const timelineOptions = [
  "As soon as practical",
  "Within 30 days",
  "This quarter",
  "Researching options",
  "Not sure",
] as const;

export const leadSuccessMessage =
  "Thanks. We received your request. We'll review your information and follow up based on your preferred contact method. No obligation, no pressure.";

export const leadFormHelperCopy =
  "Start with the basics. The business details are optional. We can figure out the rest during the strategy session.";
