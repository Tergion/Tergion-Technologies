import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";
import { legalPages } from "@/features/legal/legal-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return <LegalPage content={legalPages.privacy} />;
}
