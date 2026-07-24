"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type FocusEvent } from "react";

export type FormErrorNotification = {
  id: string;
  message: string;
};

export const formValidationAlertMessage =
  "Please review the highlighted field before continuing.";

const alertDurationMs = 10_000;

export function FormErrorAlert({
  id,
  notification,
  onDismiss,
}: {
  id: string;
  notification: FormErrorNotification | null;
  onDismiss: (notificationId: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const dismissTimerRef = useRef<number | null>(null);
  const timerStartedAtRef = useRef<number | null>(null);
  const remainingMsRef = useRef(alertDurationMs);
  const hoveredRef = useRef(false);
  const focusWithinRef = useRef(false);

  useEffect(() => {
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
    }

    dismissTimerRef.current = null;
    timerStartedAtRef.current = null;
    remainingMsRef.current = alertDurationMs;
    hoveredRef.current = false;
    focusWithinRef.current = false;

    if (!notification) {
      return;
    }

    timerStartedAtRef.current = performance.now();
    dismissTimerRef.current = window.setTimeout(() => {
      dismissTimerRef.current = null;
      timerStartedAtRef.current = null;
      remainingMsRef.current = 0;
      onDismiss(notification.id);
    }, alertDurationMs);

    return () => {
      if (dismissTimerRef.current !== null) {
        window.clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
      timerStartedAtRef.current = null;
    };
  }, [notification, onDismiss]);

  function pauseTimer(reason: "hover" | "focus") {
    if (reason === "hover") {
      hoveredRef.current = true;
    } else {
      focusWithinRef.current = true;
    }

    if (
      dismissTimerRef.current === null ||
      timerStartedAtRef.current === null
    ) {
      return;
    }

    remainingMsRef.current = Math.max(
      0,
      remainingMsRef.current -
        (performance.now() - timerStartedAtRef.current),
    );
    window.clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = null;
    timerStartedAtRef.current = null;
  }

  function resumeTimer(reason: "hover" | "focus") {
    if (reason === "hover") {
      hoveredRef.current = false;
    } else {
      focusWithinRef.current = false;
    }

    if (
      !notification ||
      hoveredRef.current ||
      focusWithinRef.current ||
      dismissTimerRef.current !== null
    ) {
      return;
    }

    timerStartedAtRef.current = performance.now();
    dismissTimerRef.current = window.setTimeout(() => {
      dismissTimerRef.current = null;
      timerStartedAtRef.current = null;
      remainingMsRef.current = 0;
      onDismiss(notification.id);
    }, remainingMsRef.current);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;

    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      resumeTimer("focus");
    }
  }

  return (
    <div
      data-form-error-overlay
      className="pointer-events-none absolute inset-x-4 top-4 z-30 flex justify-end sm:left-auto sm:right-4 sm:w-[min(24rem,calc(100%-2rem))]"
    >
      <AnimatePresence mode="wait" initial={false}>
        {notification ? (
          <motion.div
            key={notification.id}
            id={id}
            role="alert"
            aria-atomic="true"
            data-form-error-alert
            data-notification-id={notification.id}
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
            className="pointer-events-auto relative min-h-12 w-full rounded-lg border border-destructive/40 bg-[var(--danger-panel-bg)] py-3 pl-3 pr-12 text-sm leading-6 text-destructive shadow-[0_14px_35px_rgba(19,42,70,0.16)]"
            onMouseEnter={() => pauseTimer("hover")}
            onMouseLeave={() => resumeTimer("hover")}
            onFocusCapture={() => pauseTimer("focus")}
            onBlurCapture={handleBlur}
          >
            <p>{notification.message}</p>
            <button
              type="button"
              aria-label="Dismiss error message"
              className="absolute right-0.5 top-0.5 grid size-11 place-items-center rounded-md text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--island-focus-ring)]"
              onClick={() => onDismiss(notification.id)}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
