"use client";

import { ArrowLeft, Mail } from "lucide-react";
import { useActionState, useRef, useState } from "react";

import { Button, buttonClass, inputClass } from "@/components/admin/ui";
import { Turnstile, type TurnstileHandle } from "@/components/turnstile";
import { requestAccess, verifyCode, type LoginState } from "./actions";

export function LoginForm({ initialError }: { initialError?: string }) {
  const turnstile = useRef<TurnstileHandle>(null);
  // "Am deja un cod": jump to the code step without asking for a new email.
  const [haveCode, setHaveCode] = useState(false);
  // The buttons wake up only when the input is complete.
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const emailReady = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  // One state for both steps: the server answers with the step to show next
  // (an expired code sends the owner back to the email step).
  const [state, act, pending] = useActionState(
    async (prev: LoginState, form: FormData) => {
      const next =
        form.get("intent") === "code"
          ? await verifyCode(prev, form)
          : await requestAccess(prev, form);
      turnstile.current?.reset();
      setHaveCode(false);
      if (next.error) setCode("");
      // Signed in: a full page load, so the address stays clean (no /admin in it).
      if (next.step === "done") window.location.replace("/");
      return next;
    },
    { step: "email", error: initialError },
  );
  const step = haveCode ? "code" : state.step;

  if (step === "done") {
    return <p className="text-[15px] text-(--ink-2)">Se deschide panoul…</p>;
  }
  const error = haveCode ? undefined : state.error;

  if (step === "code") {
    return (
      <form action={act} noValidate className="space-y-5">
        <input type="hidden" name="intent" value="code" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Verificare</h1>
          <p className="mt-1.5 text-[15px] leading-relaxed text-(--ink-2)">
            Dacă adresa are acces, ai primit instrucțiunile pe email.
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="code" className="block text-sm font-medium">
            Cod
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) =>
              // Digits only, whatever gets typed or pasted (spaces from "482 913" too).
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            autoFocus
            className={`${inputClass} tabular font-[family-name:var(--font-mono-admin)] text-xl tracking-[0.4em]`}
            aria-describedby={error ? "code-error" : undefined}
          />
          {error && (
            <p id="code-error" role="alert" className="text-sm text-(--danger)">
              {error}
            </p>
          )}
        </div>
        <Button type="submit" disabled={pending || code.length !== 6} className="w-full">
          {pending ? "Se verifică…" : "Conectează-mă"}
        </Button>
        <a href="/login" className={buttonClass("secondary", "w-full")}>
          <ArrowLeft className="size-4" aria-hidden />
          Înapoi
        </a>
      </form>
    );
  }

  return (
    <form action={act} noValidate className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Conectare</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-(--ink-2)">
          Introdu adresa de email de administrare.
        </p>
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          className={inputClass}
          aria-describedby={error ? "email-error" : undefined}
        />
        {error && (
          <p id="email-error" role="alert" className="text-sm text-(--danger)">
            {error}
          </p>
        )}
      </div>
      <Turnstile ref={turnstile} />
      <Button type="submit" disabled={pending || !emailReady} className="w-full">
        <Mail aria-hidden />
        {pending ? "Se trimite…" : "Continuă"}
      </Button>
      <button
        type="button"
        onClick={() => setHaveCode(true)}
        className={buttonClass("secondary", "w-full")}
      >
        Am deja un cod
      </button>
    </form>
  );
}
