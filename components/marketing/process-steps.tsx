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
    <ol
      aria-label="Tergion implementation process"
      className="relative grid gap-8 before:absolute before:bottom-6 before:left-6 before:top-6 before:w-px before:bg-primary/30 before:content-[''] lg:grid-cols-4 lg:gap-6 lg:before:bottom-auto lg:before:left-[12.5%] lg:before:right-[12.5%] lg:before:top-6 lg:before:h-px lg:before:w-auto"
    >
      {processSteps.map((step, index) => (
        <li
          key={step.title}
          className="relative grid grid-cols-[3rem_1fr] gap-4 lg:block"
        >
          <span className="relative z-10 grid size-12 place-items-center rounded-full bg-[var(--surface-navy)] text-sm font-semibold text-white lg:mx-auto">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="pt-1 lg:mt-5 lg:pt-0 lg:text-center">
            <h3 className="text-lg font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
