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
  "Email/SMS campaigns",
  "Website/funnel forms",
  "AI-assisted workflows",
  "Reporting/visibility",
  "Not sure yet",
] as const;

export const usesCrmValues = ["yes", "no", "not-sure"] as const;

export const usesCrmOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not-sure", label: "Not sure" },
] as const;

export const requestPriorityOptions = [
  "Just exploring",
  "Soon",
  "High priority",
  "Urgent",
] as const;

export const leadSuccessMessage =
  "Thanks. We received your request. We'll review your information and follow up based on your preferred contact method. No obligation, no pressure.";

export const leadFormHelperCopy =
  "Start with the basics. The business details are optional.";
