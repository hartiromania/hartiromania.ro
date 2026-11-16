import type React from "react";
import type { Metadata, Viewport } from "next";
import { Playfair_Display, Crimson_Text } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import ClientLayout from "./clientLayout";
import { JsonLd } from "@/components/json-ld";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, TWITTER_HANDLE } from "@/lib/site";
import { organizationLd, websiteLd } from "@/lib/structured-data";

// „latin-ext” conține ă, ș și ț; fără el, literele astea apar în fontul de rezervă.
const playfairDisplay = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair-display",
  display: "swap",
});

const crimsonText = Crimson_Text({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-crimson-text",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${playfairDisplay.variable} ${crimsonText.variable} antialiased`}>
      <body>
        <JsonLd data={[organizationLd(), websiteLd()]} />
        {/* Fără <Suspense> în jurul paginilor: altfel serverul trimite „200 OK” înainte ca o
            pagină să apuce să spună că nu există (notFound), iar Google vede un „soft 404”. */}
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}

// Valorile implicite pentru tot site-ul. Fiecare pagină își declară titlul, descrierea
// și adresa canonică prin `pageMetadata()` din lib/seo.ts.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Hărți istorice, vederi și cărți de colecție`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "shopping",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Hărți istorice, vederi și cărți de colecție`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: "/logo-principal-no-bg.webp",
    shortcut: "/logo-principal-no-bg.webp",
    apple: "/logo-principal-no-bg.webp",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
};
