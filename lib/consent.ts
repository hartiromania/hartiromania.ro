// The visitor's cookie choice. Only the optional category ("statistics" = Google Analytics)
// needs a choice; the strictly necessary storage is always on and needs no consent.
//
// The choice lives in a first-party cookie on this browser, under a random consent ID.
// Every choice is also recorded on the server (app/api/consent) as proof of consent.

export const CONSENT_COOKIE = "hr_consent";
/** Bump when the categories or the policy change in a way that needs a new choice. */
export const CONSENT_VERSION = 1;
/** Ask again after six months, as the Romanian and EU guidance recommends. */
export const CONSENT_MAX_AGE_MS = 182 * 24 * 60 * 60 * 1000;
/** Fired on window to reopen the cookie settings (footer link, policy page). */
export const OPEN_CONSENT_EVENT = "hr:open-cookie-settings";
/** Fired on window after a choice is saved. */
export const CONSENT_CHANGED_EVENT = "hr:cookie-consent-changed";

export type ConsentSource = "banner" | "settings";
export type Consent = { id: string; statistics: boolean; version: number; savedAt: number };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function isConsentId(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

/** Cookie value: `<id>.<version>.<0|1>.<savedAt ms>`. */
export function formatConsent(consent: Consent): string {
  return [consent.id, consent.version, consent.statistics ? 1 : 0, consent.savedAt].join(".");
}

/** A stored choice, or null when there is none, it is broken, outdated or expired. */
export function parseConsent(raw: string | null | undefined, now = Date.now()): Consent | null {
  const [id, version, statistics, savedAt] = (raw ?? "").split(".");
  const consent = {
    id,
    version: Number(version),
    statistics: statistics === "1",
    savedAt: Number(savedAt),
  };
  if (
    !isConsentId(consent.id) ||
    consent.version !== CONSENT_VERSION ||
    (statistics !== "0" && statistics !== "1") ||
    !Number.isInteger(consent.savedAt) ||
    consent.savedAt > now + 60_000 ||
    now - consent.savedAt > CONSENT_MAX_AGE_MS
  ) {
    return null;
  }
  return consent;
}

/** The raw cookie value, before any checks. */
export function readConsentCookie(): string | undefined {
  return document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
}

export function readConsent(): Consent | null {
  try {
    return parseConsent(readConsentCookie());
  } catch {
    return null;
  }
}

/** Stores the choice in this browser and records it on the server. Keeps the same ID. */
export function saveConsent(statistics: boolean, source: ConsentSource): Consent {
  // An expired or outdated choice still keeps its ID, so the history stays in one place.
  const previousId = readConsentCookie()?.split(".")[0];
  const consent: Consent = {
    id: isConsentId(previousId) ? previousId : crypto.randomUUID(),
    statistics,
    version: CONSENT_VERSION,
    savedAt: Date.now(),
  };
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${formatConsent(consent)}; Max-Age=${Math.floor(
    CONSENT_MAX_AGE_MS / 1000,
  )}; Path=/; SameSite=Lax${secure}`;

  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));

  // Proof of consent; a failed request never blocks the visitor.
  fetch("/api/consent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: consent.id,
      statistics,
      version: CONSENT_VERSION,
      source,
      page: window.location.pathname,
    }),
    keepalive: true,
  }).catch(() => {});
  return consent;
}

export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}
