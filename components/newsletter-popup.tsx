"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";

const STORAGE_KEY = "hr-newsletter-popup-state";
const DELAY_MS = 20000;
const DISMISSED_COOLDOWN_DAYS = 15;
const DISMISSED_COOLDOWN_MS = DISMISSED_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

type StoredState = {
  status: "dismissed" | "subscribed";
  at: number;
};

function readState(): StoredState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredState;
  } catch {
    return null;
  }
}

function writeState(state: StoredState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore — incognito/private mode may block localStorage
  }
}

function shouldSuppressPopup(state: StoredState | null): boolean {
  if (!state) return false;
  if (state.status === "subscribed") return true;
  const elapsed = Date.now() - state.at;
  return elapsed < DISMISSED_COOLDOWN_MS;
}

export function NewsletterPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    writeState({ status: "dismissed", at: Date.now() });
  }, []);

  // Efectele rulează doar în browser, după montare, deci localStorage e sigur aici.
  useEffect(() => {
    if (pathname?.startsWith("/xdxadmin")) return;

    if (shouldSuppressPopup(readState())) return;

    let isActive = true;

    const timer = setTimeout(() => {
      if (!isActive) return;
      if (shouldSuppressPopup(readState())) return;
      setIsOpen(true);
    }, DELAY_MS);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, handleDismiss]);

  const handleSuccess = () => {
    writeState({ status: "subscribed", at: Date.now() });
    setTimeout(() => setIsOpen(false), 3500);
  };

  if (!isOpen) return null;

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
      onClick={handleDismiss}
    >
      <div
        className="border-accent-orange/70 to-background animate-in zoom-in-95 relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md border-4 border-double bg-gradient-to-b from-amber-50 px-6 py-10 shadow-2xl duration-200 md:px-10 md:py-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Închide"
          className="text-muted-foreground hover:bg-accent-orange/10 hover:text-accent-orange absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h2
            id="newsletter-popup-title"
            className="text-accent-orange mb-3 text-2xl font-bold md:text-3xl"
          >
            Rămâi conectat la fascinanta istorie cartografică a României și a lumii!
          </h2>
          <p className="text-muted-foreground mb-6 text-base leading-relaxed md:text-lg">
            Abonează-te la newsletter pentru a fi la curent cu toate produsele noi și postările de
            pe blog.
          </p>
        </div>

        <NewsletterForm
          variant="popup"
          source="popup"
          showNameField
          onSuccess={handleSuccess}
          className="text-left"
        />
      </div>
    </div>
  );
}
