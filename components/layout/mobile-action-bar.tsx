"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Home, Layers3, Mail } from "lucide-react";

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
  { href: "/contact", label: "Contact", icon: Mail },
] as const;

export function MobileActionBar() {
  const pathname = usePathname();

  if (legalPaths.has(pathname)) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile"
      className="fixed z-40 flex gap-1 rounded-lg border border-glass-border bg-glass-strong p-1.5 shadow-lg shadow-accent-strong/10 supports-[backdrop-filter]:backdrop-blur-md xl:hidden"
      style={{
        bottom: "max(0.75rem, env(safe-area-inset-bottom))",
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
                ? "border-border-strong bg-accent text-foreground"
                : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            style={{ flex: "1 1 0%", minWidth: 0 }}
          >
            <Icon className="size-4" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
