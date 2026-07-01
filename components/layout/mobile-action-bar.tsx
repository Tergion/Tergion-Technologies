"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Boxes, Layers3 } from "lucide-react";

import { LeadFormModal } from "@/components/forms/lead-form-modal";

const legalPaths = new Set([
  "/privacy",
  "/terms",
  "/ai-disclosure",
  "/data-notice",
  "/third-party-notices",
  "/accessibility",
]);

export function MobileActionBar() {
  const pathname = usePathname();

  if (legalPaths.has(pathname)) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile"
      className="fixed z-40 flex gap-1.5 rounded-lg border border-white/10 bg-popover/90 p-1.5 shadow-lg shadow-black/25 supports-[backdrop-filter]:backdrop-blur-md xl:hidden"
      style={{
        bottom: "max(0.75rem, env(safe-area-inset-bottom))",
        left: "50%",
        width: "min(20rem, calc(100vw - 1.5rem))",
        transform: "translateX(-50%)",
      }}
    >
      <Link
        href="/examples"
        className="flex h-11 min-w-0 basis-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md text-[0.7rem] font-medium text-muted-foreground transition hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ flex: "1 1 0%", minWidth: 0 }}
      >
        <Boxes className="size-4" aria-hidden="true" />
        Examples
      </Link>
      <Link
        href="/services"
        className="flex h-11 min-w-0 basis-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md text-[0.7rem] font-medium text-muted-foreground transition hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ flex: "1 1 0%", minWidth: 0 }}
      >
        <Layers3 className="size-4" aria-hidden="true" />
        Services
      </Link>
      <div
        className="min-w-0 basis-0 flex-1"
        style={{ flex: "1 1 0%", minWidth: 0 }}
      >
        <LeadFormModal
          label="Start"
          className="h-11 w-full min-w-0 shrink flex-col gap-0.5 overflow-hidden whitespace-normal px-1 text-[0.7rem] shadow-none"
          icon={<ArrowRight className="size-4" aria-hidden="true" />}
        />
      </div>
    </nav>
  );
}
