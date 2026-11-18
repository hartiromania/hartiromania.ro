"use client";

// Cloudflare Turnstile, invisible. It adds a hidden "cf-turnstile-response" field to the
// form it sits in; the server checks that token. Renders nothing when no site key is set.
import Script from "next/script";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          appearance?: "always" | "execute" | "interaction-only";
          language?: string;
          "error-callback"?: (code: string) => boolean;
        },
      ) => string | undefined;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export interface TurnstileHandle {
  /** A token works once: call after each submit to get a fresh one. */
  reset: () => void;
}

export const Turnstile = forwardRef<TurnstileHandle>(function Turnstile(_, ref) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);

  const render = () => {
    if (!SITE_KEY || !box.current || widget.current) return;
    widget.current = window.turnstile?.render(box.current, {
      sitekey: SITE_KEY,
      appearance: "interaction-only",
      language: "ro",
      // A failed check must not break the page; the server scores the missing token.
      "error-callback": () => true,
    });
  };

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widget.current) window.turnstile?.reset(widget.current);
    },
  }));

  useEffect(
    () => () => {
      if (widget.current) window.turnstile?.remove(widget.current);
    },
    [],
  );

  if (!SITE_KEY) return null;
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={render}
      />
      <div ref={box} />
    </>
  );
});
