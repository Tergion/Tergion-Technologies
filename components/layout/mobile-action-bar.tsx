"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Home, Layers3, Mail } from "lucide-react";

import { RequestModalTrigger } from "@/components/forms/request-modal-trigger";
import { cn } from "@/lib/utils";

const legalPaths = new Set([
  "/privacy",
  "/terms",
  "/ai-disclosure",
  "/data-notice",
  "/third-party-notices",
  "/accessibility",
]);

const mobileLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: Layers3 },
  { href: "/examples", label: "Examples", icon: Boxes },
] as const;

export function MobileActionBar() {
  const pathname = usePathname();

  if (legalPaths.has(pathname) || pathname === "/contact") {
    return null;
  }

  return (
    <nav
      aria-label="Mobile"
      className="island-panel fixed z-40 flex gap-1 rounded-lg p-1.5 xl:hidden"
      style={{
        bottom: "max(0.85rem, env(safe-area-inset-bottom))",
        left: "50%",
        width: "min(22rem, calc(100vw - 1.5rem))",
        transform: "translateX(-50%)",
      }}
    >
      {mobileLinks.map((link) => {
        const Icon = link.icon;
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex h-11 min-w-0 basis-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md border text-[0.68rem] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "border-[color:var(--island-active-border)] bg-[var(--island-active-bg)] text-foreground"
                : "border-transparent text-muted-foreground hover:bg-[var(--island-hover-bg)] hover:text-foreground",
            )}
            style={{ flex: "1 1 0%", minWidth: 0 }}
          >
            <Icon className="size-4" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
      <RequestModalTrigger
        aria-label="Contact Tergion"
        className="flex h-11 min-w-0 basis-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-2 text-[0.68rem] font-semibold shadow-none hover:[transform:none] hover:shadow-none"
        style={{ flex: "1 1 0%", minWidth: 0 }}
      >
        <Mail className="size-4" aria-hidden="true" />
        <span>Contact</span>
      </RequestModalTrigger>
    </nav>
  );
}
