"use client";

// Keeps admin pages current without reloading: re-fetches the server data every
// few seconds while the tab is visible, and right away when the owner comes back to it.
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LiveRefresh({ seconds = 15 }: { seconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = setInterval(refresh, seconds * 1000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, seconds]);

  return null;
}
