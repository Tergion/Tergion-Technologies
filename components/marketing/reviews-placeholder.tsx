import { MessageSquare } from "lucide-react";

export function ReviewsPlaceholder() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Client feedback
        </p>
        <h2 className="mt-2 text-base font-semibold text-foreground">
          Client feedback will be added only when it is real and approved.
        </h2>
      </div>
      <div className="flex size-10 items-center justify-center rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg)] text-muted-foreground">
        <MessageSquare className="size-5" aria-hidden="true" />
      </div>
    </div>
  );
}
