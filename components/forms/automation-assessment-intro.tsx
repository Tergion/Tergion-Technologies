import { Button } from "@/components/ui/button";

export function AutomationAssessmentIntro({
  onStart,
}: {
  onStart: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--modal-bg)] px-5 py-6">
      <div className="mx-auto my-auto w-full max-w-2xl rounded-xl border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Purpose
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          Free Business Automation Assessment
        </h2>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Answer a few questions so we can identify where your business may
          benefit from better follow-up, organization, or automation.
        </p>
        <div className="mt-5 space-y-2 text-sm text-foreground">
          <p>Takes only a few minutes.</p>
          <p className="font-semibold">No obligation. No pressure.</p>
        </div>
        <Button type="button" className="mt-6 min-h-11 w-full sm:w-auto" onClick={onStart}>
          Start assessment
        </Button>
      </div>
    </div>
  );
}
