const processSteps = [
  {
    title: "Understand your current process",
    description:
      "We look at how leads, customers, appointments, and follow-ups currently move through your business.",
  },
  {
    title: "Map the automation plan",
    description:
      "We identify what should be automated, what should stay human, and where control points should exist.",
  },
  {
    title: "Build and connect the system",
    description:
      "CRM, forms, workflows, calendars, notifications, reviews, and reporting.",
  },
  {
    title: "Launch, monitor, and adjust",
    description:
      "We refine the system so it fits the business instead of forcing the business to fit the software.",
  },
];

export function ProcessSteps() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {processSteps.map((step, index) => (
        <div
          key={step.title}
          className="rounded-lg border border-white/10 bg-white/[0.025] p-5 md:p-6"
        >
          <span className="text-sm font-semibold text-primary">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-5 text-lg font-semibold text-foreground">
            {step.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  );
}
