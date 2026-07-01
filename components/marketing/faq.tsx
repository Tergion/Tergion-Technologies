const faqs = [
  {
    question: "What does Tergion Technologies do?",
    answer:
      "Tergion Technologies designs CRM, workflow automation, lead follow-up, and AI-assisted operations systems for growing businesses.",
  },
  {
    question: "Do I need to know exactly what I want automated?",
    answer:
      "No. The review starts with your current process, where follow-up breaks down, and what should stay under human control.",
  },
  {
    question: "Do you only work with GoHighLevel?",
    answer:
      "No. GoHighLevel can be one implementation tool when appropriate, but Tergion is focused on business systems and automation infrastructure.",
  },
  {
    question: "Will automation replace my team?",
    answer:
      "Automation should reduce repetitive work and improve visibility. Workflows can include review points, approvals, and manual handoffs.",
  },
  {
    question: "How does the free automation review work?",
    answer:
      "You submit the basics, Tergion reviews the context, and we follow up based on your preferred contact method.",
  },
  {
    question: "What information do I need to submit?",
    answer:
      "Only basic contact details and flexible scheduling are required. Business context is optional.",
  },
  {
    question: "Can I stay in control of what gets automated?",
    answer:
      "Yes. Tergion designs workflows with clear handoff points, visibility, and human review where it matters.",
  },
  {
    question: "Do you guarantee revenue increases?",
    answer:
      "No. We do not guarantee revenue increases. We build systems designed to improve follow-up speed, organization, visibility, and operational consistency.",
  },
];

export function FAQ() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {faqs.map((faq) => (
        <details
          key={faq.question}
          className="group rounded-lg border border-white/10 bg-white/[0.035] p-5"
        >
          <summary className="cursor-pointer list-none text-base font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {faq.question}
          </summary>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
