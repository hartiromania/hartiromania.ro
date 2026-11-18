"use client";

import { ArrowLeft, Mail } from "lucide-react";
import { useActionState, useRef, useState } from "react";

import { Button, inputClass } from "@/components/admin/ui";
import { Turnstile, type TurnstileHandle } from "@/components/turnstile";
import { requestAccess, verifyCode, type LoginState } from "./actions";

export function LoginForm({ initialError }: { initialError?: string }) {
  const turnstile = useRef<TurnstileHandle>(null);
  // "Am deja un cod": jump to the code step without asking for a new email.
  const [haveCode, setHaveCode] = useState(false);
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
      return next;
    },
    { step: "email", error: initialError },
  );
  const step = haveCode ? "code" : state.step;
  const error = haveCode ? undefined : state.error;

  if (step === "code") {
    return (
      <form action={act} noValidate className="space-y-5">
        <input type="hidden" name="intent" value="code" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Verifică emailul</h1>
          <p className="mt-1.5 text-[15px] leading-relaxed text-(--ink-2)">
            Dacă adresa e cea a site-ului, ți-am trimis un link de conectare și un cod. Ambele
            expiră în 10 minute.
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="code" className="block text-sm font-medium">
            Codul din email
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            onInput={(e) => {
              // Digits only, whatever gets typed or pasted (spaces from "482 913" too).
              e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 6);
            }}
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
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Se verifică…" : "Conectează-mă"}
        </Button>
        <a
          href="/conectare"
          className="flex items-center justify-center gap-1.5 text-sm text-(--ink-2) hover:text-(--ink)"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Trimite alt cod
        </a>
      </form>
    );
  }

  return (
    <form action={act} noValidate className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Conectare</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-(--ink-2)">
          Scrie adresa de email a site-ului. Îți trimitem un link și un cod, fără parolă.
        </p>
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Adresa de email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
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
      <Button type="submit" disabled={pending} className="w-full">
        <Mail aria-hidden />
        {pending ? "Se trimite…" : "Trimite linkul"}
      </Button>
      <button
        type="button"
        onClick={() => setHaveCode(true)}
        className="w-full cursor-pointer text-center text-sm text-(--ink-2) hover:text-(--ink)"
      >
        Am deja un cod
      </button>
    </form>
  );
}
