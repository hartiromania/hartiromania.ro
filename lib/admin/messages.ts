// Contact messages as the admin sees them.
import "server-only";

import { and, count, desc, eq, gte, isNull, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";

const t = schema.contactMessages;

export type MessageFolder = "inbox" | "spam" | "arhiva";

/** A message is spam when the owner said so, or when the filter said so and the owner didn't overrule it. */
const isSpam = sql`coalesce(${t.markedAs} = 'spam', ${t.verdict} = 'suspect')`;

function folderWhere(folder: MessageFolder) {
  if (folder === "arhiva") return eq(t.archived, true);
  return and(eq(t.archived, false), folder === "spam" ? isSpam : sql`not ${isSpam}`);
}

export async function listMessages(folder: MessageFolder, limit = 100) {
  return db()
    .select({
      id: t.id,
      receivedAt: t.receivedAt,
      name: t.name,
      email: t.email,
      subject: t.subject,
      preview: sql<string>`left(${t.message}, 160)`,
      score: t.score,
      readAt: t.readAt,
    })
    .from(t)
    .where(folderWhere(folder))
    .orderBy(desc(t.receivedAt))
    .limit(limit);
}

export async function getMessage(id: string) {
  if (!/^[0-9a-f-]{36}$/.test(id)) return undefined;
  const [row] = await db().select().from(t).where(eq(t.id, id));
  return row;
}

export function spamOf(message: { markedAs: "ok" | "spam" | null; verdict: "ok" | "suspect" }) {
  return message.markedAs ? message.markedAs === "spam" : message.verdict === "suspect";
}

export async function folderCounts() {
  const [row] = await db()
    .select({
      unread: sql<number>`count(*) filter (where ${t.readAt} is null and not ${t.archived} and not ${isSpam})`,
      spam: sql<number>`count(*) filter (where not ${t.archived} and ${isSpam})`,
      today: sql<number>`count(*) filter (where ${t.receivedAt} >= date_trunc('day', now() at time zone 'Europe/Bucharest') at time zone 'Europe/Bucharest')`,
      week: sql<number>`count(*) filter (where ${t.receivedAt} >= now() - interval '7 days')`,
    })
    .from(t);
  return {
    unread: Number(row?.unread ?? 0),
    spam: Number(row?.spam ?? 0),
    today: Number(row?.today ?? 0),
    week: Number(row?.week ?? 0),
  };
}

export async function unreadCount() {
  const [row] = await db()
    .select({ n: count() })
    .from(t)
    .where(and(isNull(t.readAt), eq(t.archived, false), sql`not ${isSpam}`));
  return Number(row?.n ?? 0);
}

export async function recentMessages(limit = 6) {
  return db()
    .select({
      id: t.id,
      receivedAt: t.receivedAt,
      name: t.name,
      subject: t.subject,
      readAt: t.readAt,
    })
    .from(t)
    .where(
      and(
        eq(t.archived, false),
        sql`not ${isSpam}`,
        gte(t.receivedAt, sql`now() - interval '30 days'`),
      ),
    )
    .orderBy(desc(t.receivedAt))
    .limit(limit);
}

export async function updateMessage(
  id: string,
  values: Partial<Pick<typeof t.$inferInsert, "markedAs" | "readAt" | "archived">>,
) {
  await db().update(t).set(values).where(eq(t.id, id));
}

export async function deleteMessage(id: string) {
  await db().delete(t).where(eq(t.id, id));
}
