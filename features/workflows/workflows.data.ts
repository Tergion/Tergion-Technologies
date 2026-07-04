import type { WorkflowShowcase } from "@/features/workflows/workflow.types";

export const workflows: WorkflowShowcase[] = [
  {
    slug: "website-leads",
    tabLabel: "Website Leads",
    eyebrow: "Lead intake",
    headline: "From form submission to qualified follow-up.",
    summary:
      "Turn website inquiries into a visible follow-up process with CRM records, review points, and clear team ownership.",
    imageSrc: null,
    imageAlt:
      "Illustrative website lead workflow showing intake, CRM creation, qualification notes, follow-up, task assignment, and booking.",
    primaryCta: "Turn form submissions into follow-up",
    exampleHref: "/examples/form-to-crm",
    steps: [
      {
        title: "Website form submitted",
        summary:
          "The inquiry is captured with the visitor's submitted details and the page or source context available to the business.",
        controlPoint: "Intake",
      },
      {
        title: "CRM contact created",
        summary:
          "A contact record is created or updated so the lead is trackable instead of sitting only in an inbox.",
        controlPoint: "CRM",
      },
      {
        title: "AI-assisted qualification note generated",
        summary:
          "AI support can draft a short internal note from the submitted context for human review.",
        controlPoint: "AI note",
      },
      {
        title: "Follow-up email or SMS queued",
        summary:
          "Approved follow-up messaging is prepared based on contact preference and consent rules.",
        controlPoint: "Follow-up",
      },
      {
        title: "Task assigned to the team",
        summary:
          "The right person receives a visible task with the contact record and next action attached.",
        controlPoint: "Owner",
      },
      {
        title: "Strategy call booked",
        summary:
          "When the lead is ready, scheduling moves into a clear next step without implying an appointment is confirmed automatically.",
        controlPoint: "Booking",
      },
    ],
  },
  {
    slug: "missed-calls",
    tabLabel: "Missed Calls",
    eyebrow: "Call recovery",
    headline: "Never miss a lead.",
    summary:
      "Help missed calls move into a controlled recovery workflow with text-back options, CRM routing, and appointment follow-up.",
    imageSrc: null,
    imageAlt:
      "Illustrative missed-call recovery workflow showing call detection, text-back, reply handling, CRM routing, appointment options, and scheduling.",
    primaryCta: "Build a missed-call recovery system",
    exampleHref: "/examples/missed-call-recovery",
    steps: [
      {
        title: "Missed call detected",
        summary:
          "The workflow starts when a call is missed during configured hours or under approved business rules.",
        controlPoint: "Trigger",
      },
      {
        title: "Instant text-back sent",
        summary:
          "A polite response can be queued or sent when SMS consent and business rules support it.",
        controlPoint: "Text-back",
      },
      {
        title: "Lead replies",
        summary:
          "The customer response is captured so the team can see context before taking the next step.",
        controlPoint: "Reply",
      },
      {
        title: "Contact routed into CRM",
        summary:
          "The contact is created or updated and routed to the correct owner, pipeline, or follow-up stage.",
        controlPoint: "Route",
      },
      {
        title: "Appointment options presented",
        summary:
          "The system can support scheduling options while keeping the final workflow aligned with business availability.",
        controlPoint: "Options",
      },
      {
        title: "Call scheduled",
        summary:
          "The team receives visibility into the scheduled follow-up and any manual review needed before the call.",
        controlPoint: "Schedule",
      },
    ],
  },
  {
    slug: "quotes",
    tabLabel: "Quotes",
    eyebrow: "Sales follow-up",
    headline: "Keep quotes moving after they are sent.",
    summary:
      "Create a structured quote follow-up path so open estimates have timing, ownership, and status visibility.",
    imageSrc: null,
    imageAlt:
      "Illustrative quote follow-up workflow showing quote sent status, reminder scheduling, customer messaging, second follow-up, team task, and status update.",
    primaryCta: "Automate quote follow-up",
    exampleHref: "/examples/quote-follow-up",
    steps: [
      {
        title: "Quote marked as sent",
        summary:
          "The workflow starts when the team marks a quote, estimate, or proposal as sent.",
        controlPoint: "Sent",
      },
      {
        title: "Follow-up reminder scheduled",
        summary:
          "A reminder cadence is created based on the sales cycle and the business's preferred timing.",
        controlPoint: "Timing",
      },
      {
        title: "Customer receives message",
        summary:
          "A clear follow-up message can be sent or queued from approved wording.",
        controlPoint: "Message",
      },
      {
        title: "No response triggers second follow-up",
        summary:
          "If the customer does not respond, the system can support a second conservative follow-up.",
        controlPoint: "No reply",
      },
      {
        title: "Team task created",
        summary:
          "A human owner receives the next action so the quote does not depend on memory.",
        controlPoint: "Task",
      },
      {
        title: "Quote status updated",
        summary:
          "The CRM reflects the current stage as the customer responds, pauses, accepts, or declines.",
        controlPoint: "Status",
      },
    ],
  },
  {
    slug: "reviews",
    tabLabel: "Reviews",
    eyebrow: "Customer feedback",
    headline: "Make review follow-up consistent.",
    summary:
      "Support review request workflows after completed work without fake reviews, pressure tactics, or unsupported outcome claims.",
    imageSrc: null,
    imageAlt:
      "Illustrative review request workflow showing completed service, thank-you message, review request, customer review, team notification, and reporting update.",
    primaryCta: "Create a review request workflow",
    exampleHref: "/examples/review-automation",
    steps: [
      {
        title: "Service completed",
        summary:
          "The workflow begins only after the business marks the job, visit, or service as complete.",
        controlPoint: "Complete",
      },
      {
        title: "Thank-you message sent",
        summary:
          "A simple thank-you can be sent before any review request, using approved wording.",
        controlPoint: "Thanks",
      },
      {
        title: "Review request triggered",
        summary:
          "The request is sent according to timing, eligibility, and customer exclusion rules.",
        controlPoint: "Request",
      },
      {
        title: "Customer leaves review",
        summary:
          "The customer chooses whether to leave feedback; the workflow does not imply guaranteed review improvement.",
        controlPoint: "Customer",
      },
      {
        title: "Team notified",
        summary:
          "The team receives visibility into completed requests, exceptions, and follow-up needs.",
        controlPoint: "Notify",
      },
      {
        title: "Reporting updated",
        summary:
          "Request activity can be reflected in reporting so the process is easier to monitor.",
        controlPoint: "Report",
      },
    ],
  },
  {
    slug: "appointments",
    tabLabel: "Appointments",
    eyebrow: "Scheduling support",
    headline: "Make it easier for customers to show up.",
    summary:
      "Use reminders and confirmation steps to support appointment communication without removing team oversight.",
    imageSrc: null,
    imageAlt:
      "Illustrative appointment reminder workflow showing booking, reminder sequence, confirmation request, customer response, team notification, and calendar update.",
    primaryCta: "Set up appointment reminders",
    exampleHref: "/examples/appointment-reminders",
    steps: [
      {
        title: "Appointment booked",
        summary:
          "The workflow starts after a consultation, estimate, or service appointment is placed on the calendar.",
        controlPoint: "Booked",
      },
      {
        title: "Reminder sequence scheduled",
        summary:
          "Reminder timing is created around the appointment type and the business's communication rules.",
        controlPoint: "Sequence",
      },
      {
        title: "Confirmation request sent",
        summary:
          "The customer receives a clear request to confirm or take the next scheduling action.",
        controlPoint: "Confirm",
      },
      {
        title: "Customer confirms or reschedules",
        summary:
          "Responses are captured so the business can see whether the appointment needs attention.",
        controlPoint: "Response",
      },
      {
        title: "Team notified",
        summary:
          "The team is alerted when a confirmation, reschedule, or manual follow-up is needed.",
        controlPoint: "Notify",
      },
      {
        title: "Calendar updated",
        summary:
          "Calendar visibility stays aligned with the customer response and team scheduling process.",
        controlPoint: "Calendar",
      },
    ],
  },
  {
    slug: "nurture",
    tabLabel: "Nurture",
    eyebrow: "Pipeline follow-up",
    headline: "Keep warm leads from going cold.",
    summary:
      "Help open opportunities stay organized with interest tags, follow-up sequences, reply detection, and visible sales tasks.",
    imageSrc: null,
    imageAlt:
      "Illustrative lead nurture workflow showing pipeline entry, interest tagging, follow-up sequence, behavior detection, sales task creation, and pipeline update.",
    primaryCta: "Build a lead nurture system",
    exampleHref: "/examples/lead-nurture",
    steps: [
      {
        title: "Lead enters pipeline",
        summary:
          "A lead is added to the CRM from a form, call, referral, event, or other approved source.",
        controlPoint: "Pipeline",
      },
      {
        title: "Interest tag added",
        summary:
          "Tags or fields help organize what the lead asked about and what follow-up may be relevant.",
        controlPoint: "Interest",
      },
      {
        title: "Follow-up sequence starts",
        summary:
          "A conservative cadence can keep the conversation visible without overwhelming the customer.",
        controlPoint: "Sequence",
      },
      {
        title: "Reply or behavior detected",
        summary:
          "Replies or relevant behavior can pause automation and bring the lead back to human attention.",
        controlPoint: "Signal",
      },
      {
        title: "Sales task created",
        summary:
          "A team member receives the next action with enough context to follow up appropriately.",
        controlPoint: "Task",
      },
      {
        title: "Pipeline updated",
        summary:
          "The lead's stage is updated so open opportunities remain easier to review and manage.",
        controlPoint: "Update",
      },
    ],
  },
];
