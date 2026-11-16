"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { NewsletterPopup } from "@/components/newsletter-popup";

function ScrollToTop() {
  const pathname = usePathname();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

function ContentProtection() {
  const [isAdminMode, setIsAdminMode] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const checkAdminCookie = () => {
      const hasAdminCookie = document.cookie
        .split("; ")
        .some((cookie) => cookie.startsWith("xdxadmin="));
      setIsAdminMode(hasAdminCookie);
    };

    checkAdminCookie();
    const interval = setInterval(checkAdminCookie, 1000);

    return () => clearInterval(interval);
  }, [pathname]);

  React.useEffect(() => {
    if (isAdminMode) {
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
  }, [isAdminMode]);

  return null;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollToTop />
      <ContentProtection />
      {children}
      <NewsletterPopup />
    </>
  );
}
