import Link from "next/link";

import { PageHeader, Panel, Tag, timeAgo } from "@/components/admin/ui";
import {
  activityLabel,
  journal,
  journalStats,
  ownerIps,
  type JournalFilter,
} from "@/lib/admin/activity";

export const metadata = { title: "Jurnal" };

const FILTERS: { key: JournalFilter; label: string }[] = [
  { key: "all", label: "Tot" },
  { key: "logins", label: "Conectări" },
  { key: "failed", label: "Încercări eșuate" },
  { key: "views", label: "Pagini deschise" },
  { key: "changes", label: "Modificări" },
];

const FAILED = new Set(["login.code_wrong", "login.link_invalid"]);

const EXACT = new Intl.DateTimeFormat("ro-RO", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "Europe/Bucharest",
});

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const filter = FILTERS.find((f) => f.key === type)?.key ?? "all";
  const [rows, stats, mine] = await Promise.all([journal(filter), journalStats(), ownerIps()]);

  return (
    <>
      <PageHeader title="Jurnal" />

      <p className="tabular mb-6 text-[15px] leading-relaxed text-(--ink-2)">
        În ultimele 24 de ore: {stats.views} pagini deschise, de pe {stats.ips} adrese IP
        {stats.strangers > 0 ? (
          <>
            , dintre care <strong className="text-(--danger)">{stats.strangers} necunoscute</strong>
          </>
        ) : (
          ", toate ale tale"
        )}
        . {stats.requests} cereri de conectare,{" "}
        {stats.failures > 0 ? (
          <strong className="text-(--danger)">{stats.failures} eșuate</strong>
        ) : (
          "niciuna eșuată"
        )}
        .
      </p>

      <nav aria-label="Filtre" className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/journal" : `/journal?type=${f.key}`}
            aria-current={f.key === filter ? "page" : undefined}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              f.key === filter
                ? "bg-(--ink) text-(--surface)"
                : "border border-(--line) bg-(--surface) text-(--ink-2) hover:text-(--ink)"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <Panel>
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-(--muted)">
            Nimic înregistrat aici încă.
          </p>
        ) : (
          <ul className="divide-y divide-(--line)">
            {rows.map((row) => {
              const isOwner = row.sessionId !== null || (row.ip !== null && mine.has(row.ip));
              const failed =
                FAILED.has(row.action) ||
                (row.action === "login.requested" && row.detail?.matched === false);
              return (
                <li
                  key={row.id}
                  className="grid gap-1 px-5 py-3 sm:grid-cols-[1fr_auto] sm:gap-x-6"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[15px]">
                      <span className={failed ? "font-medium text-(--danger)" : ""}>
                        {activityLabel(row.action, row.detail ?? null)}
                      </span>
                      {isOwner ? <Tag tone="ok">tu</Tag> : <Tag tone="danger">necunoscut</Tag>}
                    </div>
                    <div className="mt-0.5 text-sm text-(--muted)">
                      {row.location ?? "locație necunoscută"} ·{" "}
                      {row.device ?? "dispozitiv necunoscut"}
                    </div>
                  </div>
                  <div className="tabular text-sm text-(--muted) sm:text-right">
                    <time
                      dateTime={row.createdAt.toISOString()}
                      title={EXACT.format(row.createdAt)}
                    >
                      {timeAgo(row.createdAt)}
                    </time>
                    <div className="font-[family-name:var(--font-mono-admin)]">{row.ip ?? "-"}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
      <p className="mt-3 text-sm text-(--muted)">
        „tu” = acțiune făcută conectat sau de pe o adresă IP de pe care te-ai conectat. Se arată
        ultimele 200 de înregistrări.
      </p>
    </>
  );
}
