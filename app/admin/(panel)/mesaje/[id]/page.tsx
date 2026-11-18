import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  MailOpen,
  Reply,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { buttonClass, Panel, Tag } from "@/components/admin/ui";
import { formatRoDate, zohoReplyUrl } from "@/lib/contact/email-template";
import { getMessage, spamOf, updateMessage } from "@/lib/admin/messages";
import { messageAction } from "../../actions";
import { DeleteMessage } from "./delete-message";

export const metadata = { title: "Mesaj" };

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const message = await getMessage(id);
  if (!message) notFound();
  if (!message.readAt) await updateMessage(message.id, { readAt: new Date() });

  const spam = spamOf(message);
  const act = messageAction.bind(null, message.id);
  const reply = zohoReplyUrl({
    input: {
      name: message.name,
      email: message.email,
      subject: message.subject,
      message: message.message,
    },
    receivedAt: message.receivedAt,
  });
  const reasons = message.reasons.filter((r) => r.startsWith("+"));

  return (
    <>
      <Link
        href={spam ? "/mesaje?dosar=spam" : message.archived ? "/mesaje?dosar=arhiva" : "/mesaje"}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-(--ink-2) hover:text-(--ink)"
      >
        <ArrowLeft className="size-4" aria-hidden /> Mesaje
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">{message.subject}</h1>
          <p className="mt-1 text-[15px] text-(--ink-2)">
            {message.name} ·{" "}
            <a href={`mailto:${message.email}`} className="underline">
              {message.email}
            </a>
          </p>
        </div>
        <Tag tone={spam ? "danger" : "ok"}>
          {spam ? "Spam" : "Verificat"} · {message.score}/100
        </Tag>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <a href={reply} target="_blank" rel="noreferrer" className={buttonClass("primary")}>
          <Reply aria-hidden /> Răspunde
        </a>
        <form action={act.bind(null, spam ? "ok" : "spam")}>
          <button className={buttonClass("secondary")}>
            {spam ? <ShieldCheck aria-hidden /> : <ShieldAlert aria-hidden />}
            {spam ? "Nu e spam" : "E spam"}
          </button>
        </form>
        <form action={act.bind(null, message.archived ? "unarchive" : "archive")}>
          <button className={buttonClass("secondary")}>
            {message.archived ? <ArchiveRestore aria-hidden /> : <Archive aria-hidden />}
            {message.archived ? "Scoate din arhivă" : "Arhivează"}
          </button>
        </form>
        <form action={act.bind(null, "unread")}>
          <button className={buttonClass("ghost")}>
            <MailOpen aria-hidden /> Marchează necitit
          </button>
        </form>
        <DeleteMessage id={message.id} />
      </div>

      <Panel className="mb-6 px-5 py-5 md:px-6">
        <div className="max-w-[70ch] text-[16px] leading-relaxed break-words whitespace-pre-wrap">
          {message.message}
        </div>
      </Panel>

      <Panel>
        <dl className="divide-y divide-(--line) text-sm">
          {[
            ["Primit", formatRoDate(message.receivedAt)],
            ["Locație", message.location ?? "necunoscută"],
            ["IP", message.ip ?? "necunoscut"],
            ["Dispozitiv", message.device ?? "necunoscut"],
            ["Email trimis", message.emailed ? "da, în Zoho" : "nu (eroare la trimitere)"],
            ...(reasons.length > 0 ? [["De ce", reasons.join("\n")]] : []),
          ].map(([term, value]) => (
            <div key={term} className="grid gap-1 px-5 py-3 sm:grid-cols-[9rem_1fr] sm:gap-6">
              <dt className="text-(--muted)">{term}</dt>
              <dd
                className={`whitespace-pre-line ${term === "IP" ? "tabular font-[family-name:var(--font-mono-admin)]" : ""}`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>
    </>
  );
}
