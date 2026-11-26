"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { disableAnalytics, enableAnalytics } from "@/lib/analytics";
import {
  CONSENT_CHANGED_EVENT,
  OPEN_CONSENT_EVENT,
  openConsentSettings,
  parseConsent,
  readConsent,
  readConsentCookie,
  saveConsent,
} from "@/lib/consent";

/** Reopens the cookie settings; used in the footer and on the cookie policy page. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      Setări cookie
    </button>
  );
}

// The stored cookie value, re-read whenever a choice is saved. null on the server and on
// the admin host, so nothing renders there.
function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
}
const cookieSnapshot = () =>
  window.location.hostname.startsWith("admin.") ? null : (readConsentCookie() ?? "");
const serverSnapshot = () => null;

function useConsent() {
  const raw = useSyncExternalStore(subscribe, cookieSnapshot, serverSnapshot);
  return { ready: raw !== null, consent: raw ? parseConsent(raw) : null };
}

// Cookie banner: asks while there is no valid choice, applies the stored one on every
// visit, and reopens from "Setări cookie". Refusing is as easy as accepting.
export function CookieConsent() {
  const { ready, consent } = useConsent();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statistics, setStatistics] = useState(false);
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  const view = !ready ? "hidden" : settingsOpen ? "settings" : consent ? "hidden" : "banner";

  useEffect(() => {
    if (consent?.statistics) enableAnalytics();
  }, [consent?.statistics]);

  useEffect(() => {
    const reopen = () => {
      setStatistics(readConsent()?.statistics ?? false);
      setSettingsOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  // Opened on purpose (footer link): move focus in, so keyboard users land on the choice.
  useEffect(() => {
    if (settingsOpen) panel.current?.focus();
  }, [settingsOpen]);

  function openSettings() {
    setStatistics(consent?.statistics ?? false);
    setSettingsOpen(true);
  }

  function choose(allowStatistics: boolean) {
    const hadStatistics = consent?.statistics === true;
    saveConsent(allowStatistics, settingsOpen ? "settings" : "banner");
    setSettingsOpen(false);
    if (!allowStatistics && hadStatistics) disableAnalytics();
  }

  if (view === "hidden") return null;

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={(e) => {
        // Escape closes the settings only when a choice already exists; the first time,
        // the visitor has to answer (no silent "accept" by dismissing).
        if (e.key === "Escape" && view === "settings" && consent) setSettingsOpen(false);
      }}
      className="border-accent-orange/60 bg-card text-card-foreground animate-in fade-in slide-in-from-bottom-4 fixed inset-x-3 bottom-3 z-[110] mx-auto max-w-3xl rounded-md border-4 border-double p-5 shadow-2xl duration-300 outline-none md:bottom-5 md:p-6"
    >
      <h2 id={titleId} className="text-foreground mb-2 text-xl font-bold md:text-2xl">
        {view === "banner" ? "Cookie-uri pe Hărți România" : "Setări cookie"}
      </h2>

      {view === "banner" ? (
        <p className="text-muted-foreground text-base leading-relaxed md:text-lg">
          Folosim cookie-uri necesare ca site-ul să funcționeze și, doar dacă ești de acord,
          cookie-uri de statistică (Google Analytics), ca să vedem ce pagini și ce hărți vă
          interesează. Îți poți schimba alegerea oricând din „Setări cookie”, jos în pagină.{" "}
          <Link
            href="/politica-cookies"
            className="text-accent-orange underline underline-offset-2 hover:no-underline"
          >
            Politica de cookie-uri
          </Link>
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          <li className="border-border flex items-start justify-between gap-4 rounded-md border p-3">
            <div>
              <p className="text-foreground text-lg font-semibold">Necesare</p>
              <p className="text-muted-foreground text-base leading-snug">
                Țin minte alegerea ta și protejează formularele de spam. Fără ele site-ul nu
                funcționează, așa că sunt mereu active.
              </p>
            </div>
            <span className="text-muted-foreground shrink-0 pt-1 text-sm font-semibold">
              Mereu active
            </span>
          </li>
          <li className="border-border rounded-md border p-3">
            <label className="flex cursor-pointer items-start justify-between gap-4">
              <span>
                <span className="text-foreground block text-lg font-semibold">
                  Statistică (Google Analytics)
                </span>
                <span className="text-muted-foreground block text-base leading-snug">
                  Ne arată, fără să afle cine ești, câți vizitatori avem, de unde vin și ce pagini
                  citesc, ca să facem site-ul mai bun.
                </span>
              </span>
              <input
                type="checkbox"
                checked={statistics}
                onChange={(e) => setStatistics(e.target.checked)}
                className="mt-1.5 h-5 w-5 shrink-0 cursor-pointer accent-[#a0501a]"
              />
            </label>
          </li>
        </ul>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {view === "banner" ? (
          <>
            <Button
              onClick={() => choose(true)}
              className="bg-accent-orange text-accent-orange-foreground hover:bg-accent-orange-dark h-11 px-6 text-base font-semibold sm:min-w-36"
            >
              Accept
            </Button>
            <Button
              variant="outline"
              onClick={() => choose(false)}
              className="border-accent-orange text-accent-orange hover:bg-accent-orange/10 h-11 px-6 text-base font-semibold sm:min-w-36"
            >
              Refuz
            </Button>
            <button
              type="button"
              onClick={openSettings}
              className="text-muted-foreground hover:text-foreground h-11 px-2 text-base underline underline-offset-2 sm:ml-auto"
            >
              Setări
            </button>
          </>
        ) : (
          <>
            <Button
              onClick={() => choose(statistics)}
              className="bg-accent-orange text-accent-orange-foreground hover:bg-accent-orange-dark h-11 px-6 text-base font-semibold sm:min-w-36"
            >
              Salvează alegerea
            </Button>
            <Button
              variant="outline"
              onClick={() => choose(true)}
              className="border-accent-orange text-accent-orange hover:bg-accent-orange/10 h-11 px-6 text-base font-semibold sm:min-w-36"
            >
              Accept toate
            </Button>
            <Link
              href="/politica-cookies"
              className="text-muted-foreground hover:text-foreground px-2 py-2 text-base underline underline-offset-2 sm:ml-auto"
            >
              Politica de cookie-uri
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

const SAVED_AT = new Intl.DateTimeFormat("ro-RO", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Bucharest",
});

/** The visitor's current choice and its ID, shown on the cookie policy page. */
export function ConsentDetails() {
  const { ready, consent } = useConsent();

  if (!ready) return null;
  return (
    <div className="border-border bg-card rounded-md border p-4 text-lg">
      {consent ? (
        <>
          <p>
            Alegerea ta: statistica este{" "}
            <strong>{consent.statistics ? "acceptată" : "refuzată"}</strong>, din{" "}
            {SAVED_AT.format(consent.savedAt)}.
          </p>
          <p className="text-muted-foreground mt-1 text-base break-all">
            ID-ul consimțământului: <code>{consent.id}</code>
          </p>
        </>
      ) : (
        <p>Nu ai ales încă nimic pe acest dispozitiv.</p>
      )}
      <CookieSettingsButton className="bg-accent-orange text-accent-orange-foreground hover:bg-accent-orange-dark mt-3 inline-flex h-11 cursor-pointer items-center rounded-md px-5 text-base font-semibold" />
    </div>
  );
}
