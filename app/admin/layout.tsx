import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";

import { PageViewBeacon } from "@/components/admin/page-view-beacon";

import "./admin.css";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-mono-admin",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin Hărți România" },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e10" },
  ],
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`admin ${outfit.variable} ${mono.variable} min-h-dvh`}>
      {children}
      <PageViewBeacon />
    </div>
  );
}
