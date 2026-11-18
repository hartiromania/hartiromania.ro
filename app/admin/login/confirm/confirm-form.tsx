"use client";

import { useActionState } from "react";

import { Button, buttonClass } from "@/components/admin/ui";
import { confirmLink, type ConfirmState } from "../actions";

export function ConfirmForm({ token }: { token: string }) {
  const [state, act, pending] = useActionState(
    async (prev: ConfirmState, form: FormData) => {
      const next = await confirmLink(prev, form);
      // Signed in: a full page load, so the address stays clean (no /admin in it).
      if (next.done) window.location.replace("/");
      return next;
    },
    { done: false },
  );

  if (state.done) {
    return <p className="text-[15px] text-(--ink-2)">Se deschide panoul…</p>;
  }

  return (
    <form action={act} className="w-full max-w-[380px] space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Confirmare</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-(--ink-2)">
          Continuă pentru a intra din acest browser.
        </p>
      </div>
      <input type="hidden" name="token" value={token} />
      {state.error && (
        <p role="alert" className="text-sm text-(--danger)">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={!token || pending}>
        {pending ? "Se verifică…" : "Continuă"}
      </Button>
      {state.error && (
        <a href="/login" className={buttonClass("secondary", "w-full")}>
          Înapoi
        </a>
      )}
    </form>
  );
}
