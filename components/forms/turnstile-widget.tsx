"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export type TurnstileStatus =
  | "loading"
  | "ready"
  | "expired"
  | "error"
  | "development-bypass";

type TurnstileWidgetProps = {
  onToken: (token: string) => void;
  onStatusChange: (status: TurnstileStatus) => void;
};

type TurnstileRenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: TurnstileRenderOptions,
  ) => string | undefined;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const localHostnames = new Set(["localhost", "127.0.0.1", "::1"]);

export function TurnstileWidget({
  onToken,
  onStatusChange,
}: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [status, setStatus] = useState<TurnstileStatus>(() =>
    siteKey ? "loading" : "error",
  );

  const updateStatus = useCallback(
    (nextStatus: TurnstileStatus) => {
      setStatus(nextStatus);
      onStatusChange(nextStatus);
    },
    [onStatusChange],
  );

  const resetWidget = useCallback(() => {
    onToken("");

    if (widgetIdRef.current && window.turnstile) {
      updateStatus("loading");
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [onToken, updateStatus]);

  useEffect(() => {
    if (siteKey) {
      return;
    }

    const statusTimer = window.setTimeout(() => {
      if (localHostnames.has(window.location.hostname)) {
        updateStatus("development-bypass");
        return;
      }

      updateStatus("error");
    }, 0);

    return () => window.clearTimeout(statusTimer);
  }, [siteKey, updateStatus]);

  useEffect(() => {
    if (!siteKey || !scriptReady || !containerRef.current || !window.turnstile) {
      return;
    }

    if (widgetIdRef.current) {
      return;
    }

    onToken("");
    const widgetId = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token) => {
        onToken(token);
        updateStatus("ready");
      },
      "expired-callback": () => {
        onToken("");
        updateStatus("expired");
      },
      "error-callback": () => {
        onToken("");
        updateStatus("error");
      },
    });

    widgetIdRef.current = widgetId ?? null;

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onToken, scriptReady, siteKey, updateStatus]);

  if (!siteKey) {
    return (
      <div
        className="rounded-md border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-3 text-xs leading-5 text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        {status === "development-bypass"
          ? "Spam protection is disabled for local testing."
          : "Spam protection is unavailable. Please refresh the page or try again later."}
      </div>
    );
  }

  const statusMessage = {
    loading: "Checking spam protection...",
    ready: "Spam protection is ready.",
    expired: "Spam protection expired. Run the check again to continue.",
    error: "Spam protection could not complete. Run the check again or refresh the page.",
    "development-bypass": "Spam protection is disabled for local testing.",
  }[status];

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => updateStatus("error")}
      />
      <div className="rounded-md border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-3 text-xs text-muted-foreground">
        <div ref={containerRef} />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p role="status" aria-live="polite">
            {statusMessage}
          </p>
          {status === "expired" || status === "error" ? (
            <Button
              type="button"
              variant="outline"
              className="h-8 border-[color:var(--field-border)] bg-[var(--field-bg)] px-3 text-xs"
              onClick={resetWidget}
            >
              Run check again
            </Button>
          ) : null}
        </div>
      </div>
    </>
  );
}
