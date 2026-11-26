"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { CookieConsent } from "@/components/cookie-consent";
import { NewsletterPopup } from "@/components/newsletter-popup";

function ScrollToTop() {
  const pathname = usePathname();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

// Right-click / copy / image-drag blocking, switched on and off from the admin
// ("Setări"). Off until the setting says otherwise, and never on the admin itself.
function ContentProtection() {
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    if (window.location.hostname.startsWith("admin.")) return;
    let cancelled = false;
    fetch("/api/site-settings")
      .then((response) => response.json())
      .then((settings: { copyProtection?: boolean }) => {
        if (!cancelled) setEnabled(settings.copyProtection === true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!enabled) {
      document.body.classList.remove("content-protected");
      return;
    }

    document.body.classList.add("content-protected");

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "c" || e.key === "a" || e.key === "x" || e.key === "u")
      ) {
        e.preventDefault();
        return false;
      }
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }
    };

    const handleDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.body.classList.remove("content-protected");
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, [enabled]);

  return null;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollToTop />
      <ContentProtection />
      {children}
      <NewsletterPopup />
      <CookieConsent />
    </>
  );
}
