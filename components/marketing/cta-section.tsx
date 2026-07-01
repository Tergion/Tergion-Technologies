import { LeadFormModal } from "@/components/forms/lead-form-modal";
import { GlassCard } from "@/components/marketing/glass-card";

export function CTASection() {
  return (
    <section id="contact" className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <GlassCard className="overflow-hidden p-8 md:p-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Automation review
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl xl:text-5xl">
              Start with a focused systems review.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg">
              Submit the basics, skip the optional details if you want, and
              Tergion will follow up based on your preferred contact method.
            </p>
            <div className="mt-8">
              <LeadFormModal label="Start the request" className="h-12 px-5" />
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
