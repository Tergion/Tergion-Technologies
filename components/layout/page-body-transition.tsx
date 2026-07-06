"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function PageBodyTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-body-transition">
      {children}
    </div>
  );
}
