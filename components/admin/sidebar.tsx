"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV } from "@/lib/admin/nav";
import { SignOutButton } from "./sign-out-button";

// Pages are served from the admin host root, but render under /admin internally.
function active(pathname: string, href: string) {
  const path = pathname.replace(/^\/admin(?=\/|$)/, "") || "/";
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
}

export function Sidebar({ unread }: { unread: number }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-20 flex flex-col border-b border-(--line) bg-(--surface) md:h-dvh md:w-60 md:shrink-0 md:border-r md:border-b-0">
      <div className="flex items-center gap-2.5 px-4 py-3 md:px-5 md:py-5">
        <Image
          src="/logo-principal-no-bg-cropped.png"
          alt=""
          width={28}
          height={28}
          className="size-7 object-contain"
        />
        <span className="font-semibold">Hărți România</span>
      </div>

      <nav
        aria-label="Meniu admin"
        className="flex [scrollbar-width:none] gap-1 overflow-x-auto px-2 pb-2 md:flex-1 md:flex-col md:px-3 md:pb-0"
      >
        {NAV.map((item) => {
          const isActive = active(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-[15px] transition-colors ${
                isActive
                  ? "bg-(--sunken) font-medium text-(--ink)"
                  : "text-(--ink-2) hover:bg-(--sunken) hover:text-(--ink)"
              }`}
            >
              <Icon className={`size-[18px] ${isActive ? "text-(--accent)" : ""}`} aria-hidden />
              {item.label}
              {item.badge === "unread" && unread > 0 && (
                <span className="tabular ml-auto rounded-md bg-(--accent) px-1.5 text-xs font-semibold text-white">
                  {unread}
                  <span className="sr-only"> necitite</span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-(--line) p-3 md:block">
        <SignOutButton className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[15px] text-(--ink-2) transition-colors hover:bg-(--sunken) hover:text-(--ink)" />
      </div>
    </aside>
  );
}
