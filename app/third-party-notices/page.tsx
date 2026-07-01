import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";
import { legalPages } from "@/features/legal/legal-content";

export const metadata: Metadata = {
  title: "Third-Party Notices",
};

export default function ThirdPartyNoticesPage() {
  return <LegalPage content={legalPages["third-party-notices"]} />;
}
