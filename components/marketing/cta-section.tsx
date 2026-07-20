import { RequestModalTrigger } from "@/components/forms/request-modal-trigger";
import { GlassCard } from "@/components/marketing/glass-card";
import { siteConfig } from "@/lib/site-config";

export function CTASection() {
  return (
    <section className="py-16 md:py-24">
      <div className="site-container">
        <GlassCard className="overflow-hidden p-8 md:p-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              When you are ready
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl xl:text-5xl">
              Talk through the systems that need attention.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg">
              Share the basics, skip the optional details if you want, and
              Tergion will follow up based on your preferred contact method.
            </p>
            <div className="mt-8">
              <RequestModalTrigger
                variant="outline"
                className="h-12 border-[color:var(--field-border)] bg-[var(--field-bg)] px-5 text-foreground"
              >
                {siteConfig.cta.final}
              </RequestModalTrigger>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
