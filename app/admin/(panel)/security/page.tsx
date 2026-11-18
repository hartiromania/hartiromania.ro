import Link from "next/link";

import { buttonClass, PageHeader, Panel, Tag, timeAgo } from "@/components/admin/ui";
import { activeSessions, requireAdmin } from "@/lib/admin/auth";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { signOutOthers } from "../actions";

export const metadata = { title: "Securitate" };

export default async function SecurityPage() {
  const current = await requireAdmin();
  const sessions = await activeSessions();
  const others = sessions.filter((s) => s.id !== current.id).length;

  return (
    <>
      <PageHeader title="Securitate">
        <SignOutButton className={buttonClass("secondary")} />
      </PageHeader>

      <Panel className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-2">
          <h2 className="font-semibold">Unde ești conectat</h2>
          {others > 0 && (
            <form action={signOutOthers}>
              <button className={buttonClass("danger", "h-9")}>
                Deconectează celelalte ({others})
              </button>
            </form>
          )}
        </div>
        <ul className="divide-y divide-(--line)">
          {sessions.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
              <div className="min-w-0 text-[15px]">
                <div>{s.device ?? "Dispozitiv necunoscut"}</div>
                <div className="text-sm text-(--muted)">
                  {s.location ?? "locație necunoscută"} ·{" "}
                  <span className="tabular font-[family-name:var(--font-mono-admin)]">
                    {s.ip ?? "-"}
                  </span>
                </div>
              </div>
              {s.id === current.id ? (
                <Tag tone="ok">acest browser</Tag>
              ) : (
                <span className="tabular text-sm text-(--muted)">
                  activ {timeAgo(s.lastSeenAt)}
                </span>
              )}
            </li>
          ))}
        </ul>
      </Panel>

      <p className="mt-3 text-sm text-(--muted)">
        Sesiunile expiră singure după 14 zile. La fiecare conectare nouă primești un email. Tot ce
        se întâmplă în admin vezi în{" "}
        <Link href="/journal" className="underline">
          Jurnal
        </Link>
        .
      </p>
    </>
  );
}
