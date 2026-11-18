"use client";

// Records every admin page opened (by the owner or anyone else) in the journal.
// Only real navigations count: the background refresh keeps the same path.
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { trackView } from "@/app/admin/track";

export function PageViewBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    trackView(pathname).catch(() => {});
  }, [pathname]);

  return null;
}
