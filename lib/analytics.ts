// Google Analytics 4, loaded only after the visitor allows statistics cookies
// (Consent Mode v2, "basic": nothing reaches Google before the choice).

import { readConsent } from "./consent";

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

let loaded = false;

// gtag.js reads the `arguments` object, not an array, so this stays a plain function.
const gtag: Gtag = function () {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
};

/** Turns statistics on: grants consent and loads gtag.js once per page load. */
export function enableAnalytics() {
  if (!GA_MEASUREMENT_ID || loaded) {
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
    return;
  }
  loaded = true;
  window.gtag = gtag;
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  gtag("js", new Date());
  // Visits from localhost or previews are marked as debug traffic (GA4 DebugView).
  const production = window.location.hostname.endsWith("hartiromania.ro");
  gtag("config", GA_MEASUREMENT_ID, production ? {} : { debug_mode: true });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}

/** Turns statistics off: denies consent and deletes the Google Analytics cookies. */
export function disableAnalytics() {
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  const host = window.location.hostname;
  const domains = ["", host, `.${host.replace(/^www\./, "")}`];
  for (const name of document.cookie.split("; ").map((c) => c.split("=")[0])) {
    if (name !== "_ga" && !name.startsWith("_ga_") && name !== "_gid") continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

/** Sends an event when statistics are on; does nothing otherwise. */
export function track(event: string, params: Record<string, unknown> = {}) {
  // A page's own effects can run before the consent banner's; the stored choice decides.
  if (!window.gtag && readConsent()?.statistics) enableAnalytics();
  window.gtag?.("event", event, params);
}

/** GA4 e-commerce shape for one product or promo pack, so item reports work. */
export function itemParams(item: {
  slug: string;
  title: string;
  priceNumeric: number;
  category?: string;
}) {
  return {
    currency: "RON",
    value: item.priceNumeric,
    items: [
      {
        item_id: item.slug,
        item_name: item.title,
        item_category: item.category ?? "promo",
        price: item.priceNumeric,
      },
    ],
  };
}
