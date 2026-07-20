import type { Metadata } from "next";

import { GlassCard } from "@/components/marketing/glass-card";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Tergion Technologies, a B2B systems, CRM, automation, and AI workflow company.",
};

export default function AboutPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="About"
        title="Tergion Technologies builds practical systems for growing companies."
        description="The company focuses on CRM implementation, workflow automation, AI-assisted operations planning, and business infrastructure that helps teams follow up faster and work with better visibility."
      />

      <section className="py-12 md:py-16">
        <div className="site-container">
          <GlassCard className="solid-panel max-w-4xl p-6 md:p-8">
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
        </div>
      </section>

      <section className="bg-[var(--surface-blue-soft)] py-12 md:py-16">
        <div className="site-container">
          <GlassCard className="solid-panel max-w-4xl p-6 md:p-8">
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
    </>
  );
}
