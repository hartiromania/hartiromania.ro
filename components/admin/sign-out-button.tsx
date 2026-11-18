"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { signOut } from "@/app/admin/(panel)/actions";

/** Signs out, then a full page load to /login (keeps the address clean). */
export function SignOutButton({ className }: { className: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await signOut();
          window.location.replace("/login");
        })
      }
      className={className}
    >
      <LogOut className="size-[18px]" aria-hidden />
      {pending ? "Se deconectează…" : "Deconectare"}
    </button>
  );
}
