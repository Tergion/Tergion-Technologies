import type { ServiceCapabilityGroup } from "@/features/services/service-capabilities.types";

export const serviceCapabilityGroups: ServiceCapabilityGroup[] = [
  {
    title: "CRM & Contacts",
    summary:
      "Organized records, tags, fields, source details, and ownership rules for customer and lead visibility.",
    items: ["Contact structure", "Custom fields", "Tags and segments", "Source tracking"],
  },
  {
    title: "Pipelines & Opportunities",
    summary:
      "Sales stages and opportunity views that help teams see what is active, stalled, or waiting for action.",
    items: ["Pipeline stages", "Opportunity records", "Assignment rules", "Status visibility"],
  },
  {
    title: "Communication Inbox",
    summary:
      "Centralized conversations so email, text, and call follow-up can stay tied to the customer record.",
    items: ["Conversation history", "Message templates", "Team handoffs", "Reply visibility"],
  },
  {
    title: "Automation & Workflows",
    summary:
      "Trigger-based follow-up, reminders, routing, and notifications with clear pause and review points.",
    items: ["Lead routing", "Reminder logic", "Internal tasks", "Manual review steps"],
  },
  {
    title: "Calendars & Scheduling",
    summary:
      "Calendar and appointment systems configured around real availability, routing, and reminder needs.",
    items: ["Calendars", "Booking rules", "Appointment reminders", "Team notifications"],
  },
  {
    title: "Forms, Surveys, Funnels & Websites",
    summary:
      "Intake paths that can route submitted information into CRM records and follow-up workflows.",
    items: ["Website forms", "Funnel forms", "Surveys", "Source-aware routing"],
  },
  {
    title: "Email Marketing",
    summary:
      "Email campaigns and follow-up sequences that support consistent communication without unsupported outcome claims.",
    items: ["Email campaigns", "Nurture sequences", "Audience segments", "Template setup"],
  },
  {
    title: "Payments",
    summary:
      "Payment-related setup can be supported when a business has an approved provider and process.",
    items: ["Payment links", "Invoice workflow support", "Provider setup support", "Operational handoffs"],
  },
  {
    title: "Reporting & Analytics",
    summary:
      "Operational reporting views for leads, appointments, communication, and workflow activity.",
    items: ["Lead reporting", "Appointment visibility", "Workflow activity", "Follow-up status"],
  },
  {
    title: "Social Planner",
    summary:
      "Planning support for approved social content calendars where it fits the business process.",
    items: ["Content calendar setup", "Post planning", "Approval flow support", "Visibility for owners"],
  },
];
