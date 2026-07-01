import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";
import { legalPages } from "@/features/legal/legal-content";

export const metadata: Metadata = {
  title: "AI Disclosure",
};

export default function AiDisclosurePage() {
  return <LegalPage content={legalPages["ai-disclosure"]} />;
}
