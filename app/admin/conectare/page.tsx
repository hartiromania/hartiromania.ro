import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { currentSession } from "@/lib/admin/auth";
import { adminPath } from "@/lib/admin/url";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Conectare" };

const ERRORS: Record<string, string> = {
  link: "Linkul a expirat sau a fost deja folosit. Cere unul nou.",
  limita: "Prea multe încercări. Mai încearcă peste 15 minute.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ eroare?: string }>;
}) {
  if (await currentSession()) redirect(adminPath("/"));
  const { eroare } = await searchParams;

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex items-center gap-3">
          <Image
            src="/logo-principal-no-bg-cropped.png"
            alt=""
            width={40}
            height={40}
            className="size-10 object-contain"
            priority
          />
          <div className="leading-tight">
            <div className="font-semibold">Hărți România</div>
            <div className="text-sm text-(--muted)">Panou de administrare</div>
          </div>
        </div>
        <LoginForm initialError={eroare ? ERRORS[eroare] : undefined} />
        <p className="mt-10 border-t border-(--line) pt-4 text-center text-xs leading-relaxed text-(--muted)">
          Acces permis doar persoanelor autorizate.
          <br />
          Fiecare accesare e înregistrată: adresa IP, locația, dispozitivul și ora.
        </p>
      </div>
    </main>
  );
}
