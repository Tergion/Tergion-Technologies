import type { Metadata } from "next";

import { ExampleCard } from "@/components/marketing/example-card";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
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
      <MarketingPageHeader
        eyebrow="Examples"
        title="Automation examples with realistic operational value."
        description="These examples show common workflow patterns. They are not live client systems, fake case studies, or guaranteed outcome claims."
      />

      <SectionShell className="pt-12 md:pt-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {examples.map((example) => (
            <ExampleCard key={example.slug} example={example} />
          ))}
        </div>
      </SectionShell>
    </>
  );
}
