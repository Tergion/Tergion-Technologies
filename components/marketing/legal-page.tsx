import type { LegalPageContent } from "@/features/legal/legal-content";

export function LegalPage({ content }: { content: LegalPageContent }) {
  return (
    <article className="mx-auto max-w-4xl px-6 pb-20 pt-32 md:pt-40">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
        Legal
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
        {content.title}
      </h1>
      <p className="mt-5 rounded-lg border border-warning/30 bg-[var(--warning-panel-bg)] p-4 text-sm leading-6 text-warning">
        {content.effectiveNote}
      </p>
      <p className="mt-8 text-lg leading-8 text-muted-foreground">
        {content.intro}
      </p>

      <div className="mt-12 space-y-10">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-semibold text-foreground">
              {section.heading}
            </h2>
            <div className="mt-4 space-y-4 text-base leading-7 text-muted-foreground">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
