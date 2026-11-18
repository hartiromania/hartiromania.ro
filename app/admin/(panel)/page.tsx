import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader, Panel, Tag, timeAgo } from "@/components/admin/ui";
import { activityLabel, recentActivity } from "@/lib/admin/activity";
import { folderCounts, recentMessages } from "@/lib/admin/messages";
import { getSettings, SETTINGS } from "@/lib/settings";

export const metadata = { title: "Panou" };

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export default async function DashboardPage() {
  const [counts, messages, activity, settings] = await Promise.all([
    folderCounts(),
    recentMessages(),
    recentActivity(6),
    getSettings(),
  ]);

  return (
    <>
      <PageHeader title="Panou" />

      <p className="tabular mb-8 text-[15px] leading-relaxed text-(--ink-2)">
        Azi ai primit{" "}
        <strong className="text-(--ink)">{plural(counts.today, "mesaj", "mesaje")}</strong>, în
        ultimele 7 zile {plural(counts.week, "mesaj", "mesaje")}.{" "}
        {counts.unread > 0 ? (
          <Link href="/messages" className="font-medium text-(--accent) underline">
            {plural(counts.unread, "necitit", "necitite")}
          </Link>
        ) : (
          "Nimic necitit."
        )}{" "}
        {counts.spam > 0 && <>În spam: {counts.spam}.</>}
      </p>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel>
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h2 className="font-semibold">Mesaje recente</h2>
            <Link
              href="/messages"
              className="flex items-center gap-1 text-sm text-(--ink-2) hover:text-(--ink)"
            >
              Toate <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          {messages.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-(--muted)">
              Niciun mesaj în ultimele 30 de zile. Mesajele din formularul de contact apar aici.
            </p>
          ) : (
            <ul className="pb-2">
              {messages.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/messages/${m.id}`}
                    className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-(--sunken)"
                  >
                    <div className="min-w-0 flex-1">
                      <div className={`truncate text-[15px] ${m.readAt ? "" : "font-semibold"}`}>
                        {m.subject}
                      </div>
                      <div className="truncate text-sm text-(--muted)">{m.name}</div>
                    </div>
                    {!m.readAt && <Tag tone="accent">nou</Tag>}
                    <time className="tabular shrink-0 text-sm text-(--muted)">
                      {timeAgo(m.receivedAt)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel className="px-5 py-4">
            <h2 className="mb-3 font-semibold">Site</h2>
            <ul className="space-y-2 text-[15px]">
              {(Object.keys(SETTINGS) as (keyof typeof SETTINGS)[]).map((key) => (
                <li key={key} className="flex items-center justify-between gap-3">
                  <span className="text-(--ink-2)">{SETTINGS[key].label}</span>
                  <Tag tone={settings[key] ? "ok" : "neutral"}>
                    {settings[key] ? "pornită" : "oprită"}
                  </Tag>
                </li>
              ))}
            </ul>
            <Link
              href="/settings"
              className="mt-3 inline-block text-sm text-(--ink-2) hover:text-(--ink)"
            >
              Schimbă setările
            </Link>
          </Panel>

          <Panel className="px-5 py-4">
            <h2 className="mb-3 font-semibold">Activitate</h2>
            {activity.length === 0 ? (
              <p className="text-sm text-(--muted)">Încă nimic de arătat.</p>
            ) : (
              <ul className="space-y-2.5">
                {activity.map((a) => (
                  <li key={a.id} className="text-sm">
                    <div>{activityLabel(a.action, a.detail ?? null)}</div>
                    <time className="tabular text-(--muted)">{timeAgo(a.createdAt)}</time>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
