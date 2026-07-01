import type { Metadata } from "next";

import { CTASection } from "@/components/marketing/cta-section";
import { GlassCard } from "@/components/marketing/glass-card";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Tergion Technologies, a B2B systems, CRM, automation, and AI workflow company.",
};

export default function AboutPage() {
  return (
    <>
      <section className="px-6 pb-8 pt-28 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            About
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Tergion Technologies builds practical systems for growing companies.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            The company focuses on CRM implementation, workflow automation,
            AI-assisted operations planning, and business infrastructure that
            helps teams follow up faster and work with better visibility.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1fr_0.8fr]">
          <GlassCard className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-foreground">
              Company overview
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Tergion Technologies is a B2B systems, CRM, automation, and
              AI-assisted operations company for growing businesses that need
              more reliable lead handling and customer communication.
            </p>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              The work centers on practical infrastructure: CRM implementation,
              workflow automation, clear handoff points, and visibility for the
              people responsible for sales and customer operations.
            </p>
          </GlassCard>
          <GlassCard className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-foreground">
              Operating principles
            </h2>
            <ul className="mt-4 space-y-3 text-base leading-7 text-muted-foreground">
              <li>Automate repetitive steps without removing owner control.</li>
              <li>Keep human review where judgment or customer trust matters.</li>
              <li>Use AI assistance to support operations, not replace the team.</li>
              <li>Build systems that are understandable enough to manage.</li>
            </ul>
          </GlassCard>
        </div>
      </section>

      <CTASection />
    </>
  );
}
