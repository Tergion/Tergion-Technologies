import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";
import { legalPages } from "@/features/legal/legal-content";

export const metadata: Metadata = {
  title: "Terms of Use",
};

export default function TermsPage() {
  return <LegalPage content={legalPages.terms} />;
}
