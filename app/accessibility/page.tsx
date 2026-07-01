import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";
import { legalPages } from "@/features/legal/legal-content";

export const metadata: Metadata = {
  title: "Accessibility Statement",
};

export default function AccessibilityPage() {
  return <LegalPage content={legalPages.accessibility} />;
}
