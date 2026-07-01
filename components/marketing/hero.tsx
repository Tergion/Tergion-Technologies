import Link from "next/link";

import { LeadFormModal } from "@/components/forms/lead-form-modal";
import { WorkflowMockup } from "@/components/marketing/workflow-mockup";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-12 pt-28 md:pb-16 md:pt-32 xl:pb-20 xl:pt-36">
      <div className="absolute inset-0 -z-10 opacity-70">
        <div className="absolute left-1/2 top-20 h-64 w-[38rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 xl:grid-cols-[1fr_0.78fr] xl:items-center">
        <div className="w-full min-w-0 max-w-[19rem] sm:max-w-[calc(100vw-3rem)] md:max-w-4xl xl:max-w-none">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Tergion Technologies
          </p>
          <h1 className="mt-5 max-w-full text-[2rem] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-4xl md:mt-6 md:text-5xl lg:text-6xl xl:text-7xl">
            Business systems, automation, and AI infrastructure for growing
            companies.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground md:mt-6 md:text-lg md:leading-8 xl:text-xl">
            Tergion Technologies helps businesses capture leads, follow up
            faster, automate repetitive work, and keep control of their sales
            and customer operations.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <LeadFormModal
              label={siteConfig.cta.primary}
              className="h-12 w-full px-5 text-base sm:w-auto"
            />
            <Link
              href="/examples"
              className={buttonVariants({
                variant: "outline",
                className:
                  "h-12 w-full border-white/15 bg-white/5 px-5 text-base text-foreground hover:bg-white/10 sm:w-auto",
              })}
            >
              {siteConfig.cta.secondary}
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No obligation. No pressure. You stay in control of the process.
          </p>
        </div>

        <div className="w-full min-w-0 max-w-[19rem] sm:max-w-[calc(100vw-3rem)] md:max-w-3xl xl:max-w-none">
          <WorkflowMockup compact />
        </div>
      </div>
    </section>
  );
}
