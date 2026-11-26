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

const primary =
  "bg-accent-orange text-accent-orange-foreground hover:bg-accent-orange-dark h-11 w-full text-base font-semibold md:w-auto md:px-6";
const secondary =
  "border-accent-orange text-accent-orange hover:bg-accent-orange/10 h-11 w-full text-base font-semibold md:w-auto md:px-6";

// Cookie banner: asks while there is no valid choice, applies the stored one on every
// visit, and reopens from "Setări cookie". Refusing is as easy as accepting.
export function CookieConsent() {
  const { ready, consent } = useConsent();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  const view = !ready ? "hidden" : settingsOpen ? "settings" : consent ? "hidden" : "banner";

  useEffect(() => {
    if (consent?.statistics) enableAnalytics();
  }, [consent?.statistics]);

  useEffect(() => {
    const reopen = () => {
      setAnalytics(readConsent()?.statistics ?? false);
      setSettingsOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  // Opened on purpose: move focus in, so keyboard users land on the choice.
  useEffect(() => {
    if (settingsOpen) panel.current?.focus();
  }, [settingsOpen]);

  function openSettings() {
    setAnalytics(consent?.statistics ?? false);
    setSettingsOpen(true);
  }

  function choose(allowAnalytics: boolean) {
    const hadAnalytics = consent?.statistics === true;
    saveConsent(allowAnalytics, settingsOpen ? "settings" : "banner");
    setSettingsOpen(false);
    if (!allowAnalytics && hadAnalytics) disableAnalytics();
  }

  if (view === "hidden") return null;
  const banner = view === "banner";

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
        if (e.key === "Escape" && !banner && consent) setSettingsOpen(false);
      }}
      className="border-border bg-card text-card-foreground animate-in fade-in slide-in-from-bottom-4 fixed inset-x-3 bottom-3 z-[110] mx-auto max-w-5xl rounded-lg border p-5 shadow-xl duration-300 outline-none md:bottom-5 md:flex md:items-center md:gap-8 md:px-6 md:py-4"
    >
      <h2 id={titleId} className="text-foreground text-xl font-bold md:sr-only">
        {banner ? "Cookie-uri" : "Preferințe cookie"}
      </h2>

      {banner ? (
        <p className="text-muted-foreground mt-1.5 text-base leading-relaxed md:mt-0 md:flex-1">
          Folosim cookie-uri ca site-ul să funcționeze și, cu acordul tău, ca să înțelegem cum este
          folosit.{" "}
          <Link
            href="/politica-cookies"
            className="text-foreground underline underline-offset-2 hover:no-underline"
          >
            Află mai multe
          </Link>
        </p>
      ) : (
        <div className="border-border divide-border mt-3 divide-y border-y md:mt-0 md:grid md:flex-1 md:grid-cols-2 md:gap-8 md:divide-y-0 md:border-0">
          <div className="flex items-start justify-between gap-4 py-3 md:py-0">
            <div>
              <p className="text-foreground font-semibold">Strict necesare</p>
              <p className="text-muted-foreground text-base leading-snug">
                Asigură funcționarea site-ului și țin minte alegerile tale.
              </p>
            </div>
            <span className="text-muted-foreground shrink-0 pt-0.5 text-sm">Mereu active</span>
          </div>
          <label className="flex cursor-pointer items-start justify-between gap-4 py-3 md:py-0">
            <span>
              <span className="text-foreground block font-semibold">Statistici</span>
              <span className="text-muted-foreground block text-base leading-snug">
                Ne arată, în mod agregat, cum este folosit site-ul, ca să îl putem îmbunătăți.
              </span>
            </span>
            <span className="relative mt-0.5 inline-flex shrink-0">
              <input
                type="checkbox"
                role="switch"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="bg-muted-foreground/60 peer-checked:bg-accent-orange peer-focus-visible:ring-accent-orange h-6 w-11 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2"
              />
              <span
                aria-hidden="true"
                className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"
              />
            </span>
          </label>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 md:mt-0 md:flex md:shrink-0 md:items-center">
        {banner ? (
          <>
            <button
              type="button"
              onClick={openSettings}
              className="text-muted-foreground hover:text-foreground order-last col-span-2 py-1.5 text-base underline underline-offset-2 md:order-first md:px-3"
            >
              Personalizează
            </button>
            <Button variant="outline" onClick={() => choose(false)} className={secondary}>
              Refuz
            </Button>
            <Button onClick={() => choose(true)} className={primary}>
              Accept
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => choose(analytics)} className={secondary}>
              Salvează
            </Button>
            <Button onClick={() => choose(true)} className={primary}>
              Accept toate
            </Button>
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

/** The visitor's current choice, shown on the cookie policy page. */
export function ConsentDetails() {
  const { ready, consent } = useConsent();

  if (!ready) return null;
  return (
    <div className="border-border bg-card rounded-md border p-4 text-lg">
      <p>
        {consent
          ? `Ai ${consent.statistics ? "acceptat" : "refuzat"} statisticile pe ${SAVED_AT.format(consent.savedAt)}.`
          : "Nu ai ales încă nimic pe acest dispozitiv."}
      </p>
      <CookieSettingsButton className="bg-accent-orange text-accent-orange-foreground hover:bg-accent-orange-dark mt-3 inline-flex h-11 cursor-pointer items-center rounded-md px-5 text-base font-semibold" />
    </div>
  );
}
