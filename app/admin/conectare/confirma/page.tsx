import type { Metadata } from "next";

import { Button } from "@/components/admin/ui";
import { confirmLink } from "../actions";

export const metadata: Metadata = { title: "Confirmă conectarea" };

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
      <form action={confirmLink} className="w-full max-w-[380px] space-y-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Confirmă conectarea</h1>
          <p className="mt-1.5 text-[15px] leading-relaxed text-(--ink-2)">
            Apasă butonul ca să intri în panoul de administrare din acest browser.
          </p>
        </div>
        <input type="hidden" name="token" value={t ?? ""} />
        <Button type="submit" className="w-full" disabled={!t}>
          Intră în admin
        </Button>
      </form>
    </main>
  );
}
