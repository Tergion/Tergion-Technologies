import type { AutomationExample } from "@/features/examples/example.types";

export const examples: AutomationExample[] = [
  {
    slug: "missed-call-recovery",
    title: "Missed Call Recovery",
    shortTitle: "Missed Calls",
    summary:
      "A follow-up workflow for businesses that lose opportunities when calls are missed during busy hours.",
    problem:
      "Many service businesses miss calls while working with customers, driving, or handling operations. Without a clear recovery process, those contacts can disappear.",
    whatUsuallyGoesWrong: [
      "Missed calls sit in a phone log without a follow-up owner.",
      "Staff do not know whether someone already responded.",
      "Follow-up messages are inconsistent or delayed.",
    ],
    whatTergionBuilds: [
      "A CRM-connected intake record for each missed call.",
      "A polite follow-up message queue with human review options.",
      "Task assignment and visibility for the person responsible.",
    ],
    workflowSteps: [
      "Missed call is detected.",
      "Contact record is created or updated.",
      "A follow-up task is assigned.",
      "A message is prepared or queued based on the configured rule.",
      "The owner can review, pause, or update the workflow.",
    ],
    ownerControls: [
      "Which calls should trigger follow-up.",
      "Message wording and review points.",
      "Who receives tasks and notifications.",
    ],
    expectedOperationalBenefits: [
      "Designed to improve follow-up speed.",
      "Helps keep customer communication from falling through the cracks.",
      "Improves visibility into unanswered inquiries.",
    ],
    customizationOptions: [
      "Business hours rules.",
      "Team assignment logic.",
      "Email, SMS, or phone-first follow-up preferences.",
    ],
    cta: "Talk through a similar missed-call recovery workflow when you are ready.",
  },
  {
    slug: "quote-follow-up",
    title: "Quote Follow-Up System",
    shortTitle: "Quote Follow-Up",
    summary:
      "A structured follow-up process for quotes, estimates, and proposals that need consistent next steps.",
    problem:
      "Quotes often go out by email or text, then follow-up depends on memory, calendars, or manual spreadsheets.",
    whatUsuallyGoesWrong: [
      "There is no clear owner for each open quote.",
      "Follow-up happens too late or not at all.",
      "Managers cannot easily see which quotes need attention.",
    ],
    whatTergionBuilds: [
      "Quote status tracking inside the CRM.",
      "Timed reminder tasks and customer follow-up sequences.",
      "Visibility for open quotes, next steps, and stalled opportunities.",
    ],
    workflowSteps: [
      "Quote is marked as sent.",
      "Follow-up schedule is created.",
      "Customer reminder is drafted or queued.",
      "Internal task is assigned if no response is received.",
      "Quote status is updated as the conversation progresses.",
    ],
    ownerControls: [
      "Follow-up timing.",
      "Customer-facing message templates.",
      "When automation pauses for human review.",
    ],
    expectedOperationalBenefits: [
      "Helps organize lead handling after a quote is sent.",
      "Can reduce repetitive manual reminders.",
      "Improves visibility into sales operations.",
    ],
    customizationOptions: [
      "Quote categories.",
      "Short-cycle or long-cycle sales timing.",
      "Different workflows by service line or deal size.",
    ],
    cta: "Talk through a similar quote follow-up workflow when you are ready.",
  },
  {
    slug: "review-automation",
    title: "Review Request Automation",
    shortTitle: "Reviews",
    summary:
      "A customer follow-up workflow that supports review requests after completed work without creating fake or pressured reviews.",
    problem:
      "Satisfied customers often are not asked for feedback at the right time, and teams may not have a consistent request process.",
    whatUsuallyGoesWrong: [
      "Review requests are sent manually and inconsistently.",
      "Customers receive messages before work is complete.",
      "No one tracks whether a request was already sent.",
    ],
    whatTergionBuilds: [
      "A completion-triggered review request workflow.",
      "Controls for timing, customer exclusions, and message review.",
      "Internal visibility into request status.",
    ],
    workflowSteps: [
      "Job or appointment is marked complete.",
      "Customer is checked against request criteria.",
      "Review request is prepared or sent based on the workflow rule.",
      "Team can monitor request status and exceptions.",
    ],
    ownerControls: [
      "When review requests are sent.",
      "Which customers should be excluded.",
      "Message templates and approval rules.",
    ],
    expectedOperationalBenefits: [
      "Can support review request workflows.",
      "Reduces manual repetitive work.",
      "Creates a clearer customer feedback process.",
    ],
    customizationOptions: [
      "Service completion triggers.",
      "Review platform links.",
      "Customer segments and exclusion criteria.",
    ],
    cta: "Talk through a similar review request workflow when you are ready.",
  },
  {
    slug: "lead-nurture",
    title: "Lead Nurture Pipeline",
    shortTitle: "Lead Nurture",
    summary:
      "A CRM workflow that helps keep open leads organized when they are not ready to move forward immediately.",
    problem:
      "Businesses often collect leads from forms, ads, calls, and referrals without a consistent follow-up cadence.",
    whatUsuallyGoesWrong: [
      "Lead status is unclear.",
      "Contacts receive inconsistent follow-up.",
      "Teams cannot see which leads are active, stale, or waiting.",
    ],
    whatTergionBuilds: [
      "Pipeline stages for lead handling.",
      "Follow-up tasks and reminders.",
      "Optional AI-assisted notes for internal review.",
    ],
    workflowSteps: [
      "Lead enters CRM.",
      "Source and interest are captured.",
      "Follow-up stage is assigned.",
      "Team receives the next action.",
      "Lead status is updated after each interaction.",
    ],
    ownerControls: [
      "Pipeline stages.",
      "Follow-up cadence.",
      "Lead assignment rules.",
    ],
    expectedOperationalBenefits: [
      "Helps organize lead handling.",
      "Improves visibility into active opportunities.",
      "Can reduce repeated manual tracking.",
    ],
    customizationOptions: [
      "Lead source rules.",
      "Sales stages.",
      "Internal notification preferences.",
    ],
    cta: "Talk through a similar lead nurture workflow when you are ready.",
  },
  {
    slug: "appointment-reminders",
    title: "Appointment Reminder System",
    shortTitle: "Appointments",
    summary:
      "A reminder workflow for appointments, consultations, estimates, and service visits.",
    problem:
      "Manual reminders are easy to miss, especially when teams are already coordinating calendars and customers.",
    whatUsuallyGoesWrong: [
      "Customers forget appointment details.",
      "Staff send reminders from personal phones.",
      "Calendar changes do not update the communication workflow.",
    ],
    whatTergionBuilds: [
      "Calendar-connected reminder logic.",
      "Customer message templates.",
      "Internal alerts for reschedules or exceptions.",
    ],
    workflowSteps: [
      "Appointment is scheduled.",
      "Reminder timing is calculated.",
      "Customer receives configured reminders.",
      "Team is alerted when action is needed.",
    ],
    ownerControls: [
      "Reminder timing.",
      "Message content.",
      "Which appointment types trigger reminders.",
    ],
    expectedOperationalBenefits: [
      "Can improve communication consistency.",
      "Reduces repetitive reminder work.",
      "Helps teams track appointment-related follow-up.",
    ],
    customizationOptions: [
      "Reminder windows.",
      "Appointment categories.",
      "Email, SMS, or call preference rules.",
    ],
    cta: "Talk through a similar appointment reminder workflow when you are ready.",
  },
  {
    slug: "form-to-crm",
    title: "Website Form to CRM Workflow",
    shortTitle: "Form to CRM",
    summary:
      "A clean intake workflow that routes website and funnel form submissions into a CRM with clear next steps.",
    problem:
      "Form submissions often go to inboxes without structured lead data, assignment, or tracking.",
    whatUsuallyGoesWrong: [
      "Form data is incomplete or scattered.",
      "No one knows who should follow up.",
      "Source and campaign context are lost.",
    ],
    whatTergionBuilds: [
      "Server-side form intake and validation.",
      "CRM contact and opportunity creation.",
      "Notifications, tasks, and attribution fields.",
    ],
    workflowSteps: [
      "Website form is submitted.",
      "Submission is validated server-side.",
      "Contact is created or updated.",
      "Task and notification are assigned.",
      "Source data is preserved for reporting.",
    ],
    ownerControls: [
      "Required fields.",
      "Assignment rules.",
      "Follow-up workflows by form type.",
    ],
    expectedOperationalBenefits: [
      "Helps organize lead capture.",
      "Improves source visibility.",
      "Supports faster follow-up workflows.",
    ],
    customizationOptions: [
      "Website, funnel, or landing page forms.",
      "UTM and source fields.",
      "CRM pipeline mapping.",
    ],
    cta: "Talk through a similar form-to-CRM workflow when you are ready.",
  },
];

export function getExampleBySlug(slug: string) {
  return examples.find((example) => example.slug === slug);
}
