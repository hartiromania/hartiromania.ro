import Link from "next/link";

import { buttonClass } from "@/components/admin/ui";

export default function AdminNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-[380px]">
        <p className="tabular text-sm text-(--muted)">404</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">Pagina nu există</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-(--ink-2)">
          Adresa e greșită sau pagina a fost mutată.
        </p>
        <Link href="/" className={buttonClass("primary", "mt-6")}>
          Înapoi la panou
        </Link>
      </div>
    </main>
  );
}
