import Link from "next/link";

import { RequestModalTrigger } from "@/components/forms/request-modal-trigger";
import { GlassCard } from "@/components/marketing/glass-card";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="relative z-10 overflow-visible pb-12 pt-28 md:pb-16 md:pt-32 xl:pb-20 xl:pt-36">
      <div className="site-container grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.72fr)] xl:items-center xl:gap-12">
        <div className="w-full min-w-0 md:max-w-4xl xl:max-w-none">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-strong">
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
            <RequestModalTrigger className="h-12 w-full px-5 text-base sm:w-auto">
              {siteConfig.cta.primary}
            </RequestModalTrigger>
            <Link
              href="/examples"
              className={buttonVariants({
                variant: "outline",
                className:
                  "h-12 w-full border-border bg-surface px-5 text-base text-foreground hover:border-border-strong hover:bg-accent sm:w-auto",
              })}
            >
              {siteConfig.cta.secondary}
            </Link>
          </div>
        </div>

        <GlassCard
          aria-hidden="true"
          className="hidden h-[34rem] w-full min-w-0 overflow-hidden xl:block"
        />
      </div>
    </section>
  );
}
