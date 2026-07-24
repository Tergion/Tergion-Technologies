"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";

type LeadSubmissionStatusProps = {
  status: "submitting" | "success";
  message: string;
  successHeading?: string;
  submittingHeading?: string;
};

export function LeadSubmissionStatus({
  status,
  message,
  successHeading = "Request received",
  submittingHeading = "Submitting your request",
}: LeadSubmissionStatusProps) {
  const completionRequested = status === "success";
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    if (!completionRequested) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const completionTimer = window.setTimeout(
      () => setShowCompletion(true),
      reduceMotion ? 0 : 480,
    );

    return () => window.clearTimeout(completionTimer);
  }, [completionRequested]);

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center bg-[var(--modal-bg)] px-5 py-10">
      <div
        className="mx-auto w-full max-w-xl rounded-xl border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-5 sm:p-6"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-center gap-3">
          <div
            className="relative h-3 flex-1 overflow-hidden rounded-full bg-[color:var(--field-border)]"
            role="progressbar"
            aria-label={
              showCompletion ? "Request submitted" : "Submitting request"
            }
            aria-valuemin={0}
            aria-valuemax={100}
            {...(showCompletion ? { "aria-valuenow": 100 } : {})}
          >
            <div
              className={`lead-submit-progress h-full w-full rounded-full bg-primary ${
                completionRequested
                  ? "lead-submit-progress-complete"
                  : "lead-submit-progress-active"
              }`}
            />
          </div>
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-success text-white transition-opacity duration-150 ${
              showCompletion ? "visible opacity-100" : "invisible opacity-0"
            }`}
            role={showCompletion ? "img" : undefined}
            aria-label={showCompletion ? "Submission complete" : undefined}
            aria-hidden={showCompletion ? undefined : true}
          >
            <Check className="size-5" aria-hidden="true" />
          </span>
        </div>

        {showCompletion ? (
          <div className="mt-5">
            <h3 className="text-lg font-semibold text-foreground">
              {successHeading}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {message}
            </p>
          </div>
        ) : (
          <div className="mt-5">
            <h3 className="text-lg font-semibold text-foreground">
              {submittingHeading}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Please keep this window open while we securely process your
              information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
