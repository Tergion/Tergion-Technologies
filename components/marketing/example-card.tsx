import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { GlassCard } from "@/components/marketing/glass-card";
import type { AutomationExample } from "@/features/examples/example.types";
import { siteConfig } from "@/lib/site-config";

export function ExampleCard({ example }: { example: AutomationExample }) {
  return (
    <GlassCard className="solid-panel flex h-full flex-col p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {example.shortTitle}
      </p>
      <h3 className="mt-4 text-xl font-semibold text-foreground">
        {example.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
        {example.summary}
      </p>
      <Link
        href={`/examples/${example.slug}`}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-foreground"
      >
        {siteConfig.cta.viewExample}
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </Link>
    </GlassCard>
  );
}
