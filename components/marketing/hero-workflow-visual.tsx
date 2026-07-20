const heroWorkflowStages = [
  { category: "LEAD INTAKE", label: "Lead captured", active: false },
  { category: "CRM", label: "CRM record created", active: false },
  { category: "AI NOTE", label: "AI qualification note", active: true },
  { category: "FOLLOW-UP", label: "Follow-up assigned", active: false },
] as const;

export function HeroWorkflowVisual() {
  return (
    <div
      role="img"
      aria-label="Example workflow from lead capture through CRM creation, AI-assisted qualification, and assigned follow-up."
      className="hero-workflow-panel relative min-h-[28rem] w-full min-w-0 overflow-hidden rounded-lg border border-white/15 p-5 sm:p-7 xl:min-h-[34rem] xl:p-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full bg-white/8 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="relative mx-auto flex min-h-[24rem] max-w-lg items-center xl:min-h-[30rem]"
      >
        <div className="relative w-full space-y-3">
          <div className="absolute bottom-7 left-[0.4rem] top-7 w-px bg-white/25" />
          {heroWorkflowStages.map((stage) => (
            <div key={stage.label} className="relative grid grid-cols-[1rem_1fr] gap-3">
              <span className="relative z-10 mt-6 size-3 rounded-full border border-white/40 bg-white" />
              <div
                className={
                  stage.active
                    ? "rounded-lg border border-white/25 bg-primary px-4 py-4 text-white shadow-[0_18px_45px_rgba(0,0,0,0.16)]"
                    : "rounded-lg border border-white/20 bg-white/8 px-4 py-4 text-white shadow-[0_18px_45px_rgba(0,0,0,0.16)]"
                }
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/70">
                  {stage.category}
                </p>
                <p className="mt-1 text-sm font-semibold sm:text-base">
                  {stage.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
