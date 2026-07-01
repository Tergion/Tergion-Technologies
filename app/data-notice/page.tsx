import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";
import { legalPages } from "@/features/legal/legal-content";

export const metadata: Metadata = {
  title: "Data Notice",
};

export default function DataNoticePage() {
  return <LegalPage content={legalPages["data-notice"]} />;
}
