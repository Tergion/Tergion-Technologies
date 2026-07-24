export type SubmittedDetail = {
  label: string;
  value: string;
  multiline?: boolean;
};

export type SubmittedDetailSection = {
  title: string;
  details: SubmittedDetail[];
};

export function SubmittedDetailList({
  sections,
  heading = "Request summary",
}: {
  sections: SubmittedDetailSection[];
  heading?: string;
}) {
  return (
    <div className="rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-4">
      <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
      <div className="mt-4 space-y-5">
        {sections.map((section) => (
          <section key={section.title}>
            <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {section.title}
            </h4>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              {section.details.map((detail) => (
                <div
                  key={`${section.title}-${detail.label}`}
                  className={detail.multiline ? "sm:col-span-2" : undefined}
                >
                  <dt className="text-muted-foreground">{detail.label}</dt>
                  <dd
                    className={
                      detail.multiline
                        ? "whitespace-pre-wrap font-medium text-foreground"
                        : "font-medium text-foreground"
                    }
                  >
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
