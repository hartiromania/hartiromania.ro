"use client";

import { useState, type FormEvent } from "react";
import { Loader2, CheckCircle2, AlertCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type NewsletterFormVariant = "footer" | "card" | "popup";

interface NewsletterFormProps {
  variant?: NewsletterFormVariant;
  source: string;
  showNameField?: boolean;
  className?: string;
  onSuccess?: () => void;
}

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterForm({
  variant = "card",
  source,
  showNameField = false,
  className,
  onSuccess,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!consent) {
      setStatus("error");
      setMessage("Te rugăm să accepți termenii de mai jos pentru a te abona.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined, source }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(data?.error || "A apărut o eroare. Te rugăm să încerci din nou.");
        return;
      }

      setStatus("success");
      setMessage(data?.message || "Mulțumim! Ești acum abonat.");
      setEmail("");
      setName("");
      if (onSuccess) onSuccess();
    } catch {
      setStatus("error");
      setMessage("Nu s-a putut realiza conexiunea. Verifică internetul și încearcă din nou.");
    }
  }

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  if (isSuccess) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-md border border-green-700/40 bg-green-50/60 p-4 text-green-900",
          className,
        )}
        role="status"
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-700" />
        <p className="text-base leading-relaxed">{message}</p>
      </div>
    );
  }

  const isFooter = variant === "footer";

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)} noValidate>
      <div className={cn("flex flex-col gap-3", isFooter ? "sm:flex-row sm:gap-2" : "")}>
        {showNameField && !isFooter && (
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Numele tău (opțional)"
            disabled={isLoading}
            maxLength={100}
            autoComplete="name"
            className="h-11 text-base"
          />
        )}

        <div className={cn("relative flex-1", isFooter ? "" : "")}>
          {!isFooter && (
            <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          )}
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="adresa@email.com"
            required
            disabled={isLoading}
            maxLength={200}
            autoComplete="email"
            className={cn("h-11 text-base", !isFooter && "pl-10")}
            aria-label="Adresa de email"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "bg-accent-orange text-accent-orange-foreground hover:bg-accent-orange-dark h-11 font-semibold tracking-wide whitespace-nowrap",
            isFooter ? "sm:w-auto" : "w-full",
            !isFooter && "px-6 text-lg",
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Se trimite…
            </>
          ) : (
            "Abonează-mă"
          )}
        </Button>
      </div>

      <label className="text-muted-foreground mt-3 flex cursor-pointer items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={isLoading}
          className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-[#d2691e]"
          aria-label="Sunt de acord cu termenii"
        />
        <span className="leading-snug">
          Sunt de acord să primesc newsletter-ul Hărți România cu noutăți despre produse și articole
          de blog. Te poți dezabona oricând.
        </span>
      </label>

      {status === "error" && message && (
        <div className="mt-3 flex items-start gap-2 text-sm text-red-700" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </form>
  );
}
