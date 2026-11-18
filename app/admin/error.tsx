"use client";

import { Button } from "@/components/admin/ui";

// Shown instead of a crash. The technical details stay in the server logs, never on screen.
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-[380px]">
        <h1 className="text-xl font-semibold tracking-tight">Ceva n-a mers</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-(--ink-2)">
          Pagina nu s-a putut încărca. Încearcă din nou; dacă se repetă, verifică mai târziu.
        </p>
        <Button onClick={reset} className="mt-6">
          Încearcă din nou
        </Button>
      </div>
    </main>
  );
}
