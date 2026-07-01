import { AutomationPreview } from "@/components/marketing/automation-preview";
import { CapabilitiesGrid } from "@/components/marketing/capabilities-grid";
import { CTASection } from "@/components/marketing/cta-section";
import { ExampleCard } from "@/components/marketing/example-card";
import { FAQ } from "@/components/marketing/faq";
import { Hero } from "@/components/marketing/hero";
import { ProcessSteps } from "@/components/marketing/process-steps";
import { ReviewsPlaceholder } from "@/components/marketing/reviews-placeholder";
import { SectionShell } from "@/components/marketing/section-shell";
import { examples } from "@/features/examples/examples.data";

export default function Home() {
  return (
    <>
      <Hero />
      <SectionShell
        eyebrow="Capabilities"
        title="Systems that support sales, operations, and customer communication."
        description="Tergion Technologies builds practical automation infrastructure with clear visibility and control points."
      >
        <CapabilitiesGrid />
      </SectionShell>

      <SectionShell
        eyebrow="Workflow"
        title="Automation with handoffs, review points, and operational clarity."
        description="This is an illustrative workflow preview, not a live client automation or real customer data."
        className="border-y border-white/10 bg-white/[0.02]"
      >
        <AutomationPreview />
      </SectionShell>

      <SectionShell
        eyebrow="Examples"
        title="Realistic automation patterns for growing businesses."
        description="Each example focuses on operational consistency without unsupported revenue guarantees."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {examples.slice(0, 6).map((example) => (
            <ExampleCard key={example.slug} example={example} />
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="process"
        eyebrow="Process"
        title="A practical build process with control built in."
        description="Automation should make a business easier to manage, not harder to control."
        className="border-y border-white/10 bg-white/[0.02]"
      >
        <ProcessSteps />
      </SectionShell>

      <section className="px-6 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <ReviewsPlaceholder />
        </div>
      </section>

      <SectionShell
        eyebrow="FAQ"
        title="Direct answers before you start."
        description="No hype, no fake metrics, and no requirement to know the full automation plan before reaching out."
      >
        <FAQ />
      </SectionShell>

      <CTASection />
    </>
  );
}
