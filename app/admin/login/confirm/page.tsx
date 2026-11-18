import type { Metadata } from "next";

import { ConfirmForm } from "./confirm-form";

export const metadata: Metadata = { title: "Confirmare" };

// The link only opens this page; signing in needs one more click. Email security
// scanners open links automatically, and they would otherwise use up the link.
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <ConfirmForm token={t ?? ""} />
    </main>
  );
}
