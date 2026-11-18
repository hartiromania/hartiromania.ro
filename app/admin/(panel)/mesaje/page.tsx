import Link from "next/link";

import { PageHeader, Panel, Tag, timeAgo } from "@/components/admin/ui";
import { folderCounts, listMessages, type MessageFolder } from "@/lib/admin/messages";

export const metadata = { title: "Mesaje" };

const FOLDERS: { key: MessageFolder; label: string; empty: string }[] = [
  {
    key: "inbox",
    label: "Primite",
    empty: "Niciun mesaj. Când cineva scrie din formularul de contact, apare aici.",
  },
  { key: "spam", label: "Spam", empty: "Nimic în spam. Mesajele suspecte ajung aici automat." },
  { key: "arhiva", label: "Arhivă", empty: "Arhiva e goală." },
];

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ dosar?: string }>;
}) {
  const { dosar } = await searchParams;
  const folder = FOLDERS.find((f) => f.key === dosar) ?? FOLDERS[0];
  const [messages, counts] = await Promise.all([listMessages(folder.key), folderCounts()]);

  return (
    <>
      <PageHeader title="Mesaje" />

      <nav aria-label="Dosare" className="mb-4 flex gap-1 border-b border-(--line)">
        {FOLDERS.map((f) => {
          const isActive = f.key === folder.key;
          const n = f.key === "inbox" ? counts.unread : f.key === "spam" ? counts.spam : 0;
          return (
            <Link
              key={f.key}
              href={f.key === "inbox" ? "/mesaje" : `/mesaje?dosar=${f.key}`}
              aria-current={isActive ? "page" : undefined}
              className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-[15px] transition-colors ${
                isActive
                  ? "border-(--accent) font-medium text-(--ink)"
                  : "border-transparent text-(--ink-2) hover:text-(--ink)"
              }`}
            >
              {f.label}
              {n > 0 && <span className="tabular text-sm text-(--muted)">{n}</span>}
            </Link>
          );
        })}
      </nav>

      <Panel>
        {messages.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-(--muted)">{folder.empty}</p>
        ) : (
          <ul className="divide-y divide-(--line)">
            {messages.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/mesaje/${m.id}`}
                  className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 px-5 py-3.5 transition-colors hover:bg-(--sunken)"
                >
                  <div className={`truncate text-[15px] ${m.readAt ? "" : "font-semibold"}`}>
                    {m.name}
                    <span className="font-normal text-(--muted)"> · {m.email}</span>
                  </div>
                  <time className="tabular text-sm text-(--muted)">{timeAgo(m.receivedAt)}</time>
                  <div className="col-span-2 truncate text-sm">
                    <span className={m.readAt ? "text-(--ink-2)" : "font-medium"}>{m.subject}</span>
                    <span className="text-(--muted)"> {m.preview}</span>
                  </div>
                  {folder.key === "spam" && (
                    <div className="col-span-2 pt-1">
                      <Tag tone="danger">scor {m.score}/100</Tag>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
