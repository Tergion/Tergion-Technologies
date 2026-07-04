import type { Metadata } from "next";

import { ExampleCard } from "@/components/marketing/example-card";
import { SectionShell } from "@/components/marketing/section-shell";
import { examples } from "@/features/examples/examples.data";

export const metadata: Metadata = {
  title: "Automation Examples",
  description:
    "Example CRM, workflow automation, and lead follow-up systems from Tergion Technologies.",
};

export default function ExamplesPage() {
  return (
    <>
      <section className="pb-8 pt-28 md:pt-36">
        <div className="site-container">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-strong">
            Examples
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Automation examples with realistic operational value.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            These examples show common workflow patterns. They are not live
            client systems, fake case studies, or guaranteed outcome claims.
          </p>
        </div>
      </section>

      <SectionShell className="pt-4 md:pt-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {examples.map((example) => (
            <ExampleCard key={example.slug} example={example} />
          ))}
        </div>
      </SectionShell>
    </>
  );
}
