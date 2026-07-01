import Image from "next/image";

import { GlassCard } from "@/components/marketing/glass-card";
import { WorkflowMockup } from "@/components/marketing/workflow-mockup";

export function AutomationPreview() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.85fr_1fr] xl:items-stretch">
      <WorkflowMockup />
      <GlassCard className="overflow-hidden p-3">
        <Image
          src="/mockups/automation-system-map.svg"
          alt="Illustrative automation system map with lead, CRM, review, follow-up, task, reminder, and report nodes."
          width={960}
          height={540}
          className="h-full min-h-72 w-full rounded-md object-cover"
        />
      </GlassCard>
    </div>
  );
}
