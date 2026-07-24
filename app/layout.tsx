import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@/lib/analytics";
import { defaultMetadata, organizationJsonLd } from "@/lib/metadata";
import { RequestModalProvider } from "@/components/forms/request-modal-provider";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { PageBodyTransition } from "@/components/layout/page-body-transition";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...defaultMetadata,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fefcf7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <RequestModalProvider>
          <SkipLink />
          <SiteHeader />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            <PageBodyTransition>{children}</PageBodyTransition>
          </main>
          <SiteFooter />
          <MobileActionBar />
        </RequestModalProvider>
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
      </body>
    </html>
  );
}
