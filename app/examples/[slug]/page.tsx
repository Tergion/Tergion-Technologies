import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CTASection } from "@/components/marketing/cta-section";
import { GlassCard } from "@/components/marketing/glass-card";
import { LeadFormModal } from "@/components/forms/lead-form-modal";
import {
  examples,
  getExampleBySlug,
} from "@/features/examples/examples.data";

type ExamplePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return examples.map((example) => ({ slug: example.slug }));
}

export async function generateMetadata({
  params,
}: ExamplePageProps): Promise<Metadata> {
  const { slug } = await params;
  const example = getExampleBySlug(slug);

  if (!example) {
    return {};
  }

  return {
    title: example.title,
    description: example.summary,
  };
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-strong" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

export default async function ExampleDetailPage({ params }: ExamplePageProps) {
  const { slug } = await params;
  const example = getExampleBySlug(slug);

  if (!example) {
    notFound();
  }

  return (
    <>
      <article className="pb-10 pt-28 md:pt-36">
        <div className="site-container">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-strong">
            Example automation
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            {example.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            {example.summary}
          </p>

          <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <GlassCard className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-foreground">
                Problem
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                {example.problem}
              </p>
            </GlassCard>
            <DetailList
              title="What usually goes wrong"
              items={example.whatUsuallyGoesWrong}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <DetailList
              title="What Tergion builds"
              items={example.whatTergionBuilds}
            />
            <DetailList title="Example workflow" items={example.workflowSteps} />
            <DetailList
              title="What the business owner controls"
              items={example.ownerControls}
            />
            <DetailList
              title="Expected operational benefit"
              items={example.expectedOperationalBenefits}
            />
            <DetailList
              title="What would be customized"
              items={example.customizationOptions}
            />
            <GlassCard className="border-border-strong bg-surface-soft-green p-6">
              <h2 className="text-xl font-semibold text-foreground">
                Next step
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {example.cta}
              </p>
              <div className="mt-5">
                <LeadFormModal label="Start the request" className="h-11 px-4" />
              </div>
            </GlassCard>
          </div>
        </div>
      </article>
      <CTASection />
    </>
  );
}
