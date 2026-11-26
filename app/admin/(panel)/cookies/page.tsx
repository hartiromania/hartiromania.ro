import Link from "next/link";

import { inputClass, PageHeader, Panel, Tag, timeAgo, buttonClass } from "@/components/admin/ui";
import { consentLog, consentStats } from "@/lib/admin/consent";
import { isConsentId } from "@/lib/consent";

export const metadata = { title: "Cookie-uri" };

const EXACT = new Intl.DateTimeFormat("ro-RO", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "Europe/Bucharest",
});

export default async function CookiesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id: rawId } = await searchParams;
  const id = rawId?.trim().toLowerCase();
  const validId = isConsentId(id) ? id : undefined;
  const [stats, rows] = await Promise.all([consentStats(), consentLog(validId)]);

  return (
    <>
      <PageHeader title="Cookie-uri" />

      <p className="tabular mb-6 text-[15px] leading-relaxed text-(--ink-2)">
        În ultimele 30 de zile, {stats.visitors} vizitatori au ales:{" "}
        <strong className="text-(--ink)">{stats.accepted} au acceptat statistica</strong> (
        {stats.rate}%), {stats.refused} au refuzat. {stats.changed} și-au schimbat alegerea din
        „Setări cookie”. Google Analytics vede doar vizitatorii care au acceptat.
      </p>

      <form method="get" action="/cookies" className="mb-4 flex flex-wrap gap-2" role="search">
        <label htmlFor="consent-id" className="sr-only">
          ID-ul consimțământului
        </label>
        <input
          id="consent-id"
          name="id"
          defaultValue={rawId ?? ""}
          placeholder="Caută după ID-ul consimțământului"
          autoComplete="off"
          spellCheck={false}
          className={`${inputClass} max-w-md font-[family-name:var(--font-mono-admin)] text-sm`}
        />
        <button type="submit" className={buttonClass("secondary")}>
          Caută
        </button>
        {rawId && (
          <Link href="/cookies" className={buttonClass("ghost")}>
            Toate
          </Link>
        )}
      </form>
      {rawId && !validId && (
        <p role="alert" className="mb-4 text-sm text-(--danger)">
          ID-ul nu are forma corectă.
        </p>
      )}

      <Panel>
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-(--muted)">
            {validId ? "Nicio alegere cu acest ID." : "Încă nu a ales nimeni."}
          </p>
        ) : (
          <ul className="divide-y divide-(--line)">
            {rows.map((row) => (
              <li key={row.id} className="grid gap-1 px-5 py-3 sm:grid-cols-[1fr_auto] sm:gap-x-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[15px]">
                    {row.statistics ? (
                      <Tag tone="ok">a acceptat</Tag>
                    ) : (
                      <Tag tone="neutral">a refuzat</Tag>
                    )}
                    <span className="text-(--ink-2)">
                      {row.source === "banner" ? "din banner" : "din Setări cookie"}
                      {row.page ? ` · pe ${row.page}` : ""}
                    </span>
                  </div>
                  <div className="mt-0.5 text-sm text-(--muted)">
                    {row.location ?? "locație necunoscută"} ·{" "}
                    {row.device ?? "dispozitiv necunoscut"}
                  </div>
                  <Link
                    href={`/cookies?id=${row.consentId}`}
                    className="mt-0.5 block truncate font-[family-name:var(--font-mono-admin)] text-xs text-(--muted) hover:text-(--ink)"
                  >
                    {row.consentId}
                  </Link>
                </div>
                <div className="tabular text-sm text-(--muted) sm:text-right">
                  <time dateTime={row.createdAt.toISOString()} title={EXACT.format(row.createdAt)}>
                    {timeAgo(row.createdAt)}
                  </time>
                  <div className="font-[family-name:var(--font-mono-admin)]">
                    {row.ipMasked ?? "-"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <p className="mt-3 text-sm text-(--muted)">
        Fiecare alegere rămâne aici ca dovadă a consimțământului. Adresa IP e păstrată fără ultima
        parte, ca să nu poată identifica pe nimeni. Se arată ultimele 200 de înregistrări.
      </p>
    </>
  );
}
