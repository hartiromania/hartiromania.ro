import { LiveRefresh } from "@/components/admin/live-refresh";
import { Sidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/admin/auth";
import { unreadCount } from "@/lib/admin/messages";

// Every page in here needs a valid session; without one, requireAdmin sends to /conectare.
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const unread = await unreadCount();

  return (
    <div className="md:flex">
      <a
        href="#continut"
        className="sr-only z-30 rounded-lg bg-(--ink) px-4 py-2 text-sm text-(--surface) focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Sari la conținut
      </a>
      <Sidebar unread={unread} />
      <main id="continut" className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
      <LiveRefresh />
    </div>
  );
}
