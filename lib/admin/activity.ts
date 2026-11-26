// The audit log in the owner's words.
import "server-only";

import { and, desc, gte, inArray, isNotNull, like, or, sql, type SQL } from "drizzle-orm";

import { db, schema } from "@/lib/db";

const LABELS: Record<string, string> = {
  "login.requested": "Cerere de conectare",
  "login.success": "Conectare reușită",
  "login.code_wrong": "Cod greșit la conectare",
  "login.link_invalid": "Link de conectare expirat sau folosit",
  logout: "Deconectare",
  "sessions.revoked_others": "Celelalte sesiuni deconectate",
  "setting.changed": "Setare modificată",
  "message.spam": "Mesaj marcat ca spam",
  "message.ok": "Mesaj marcat ca bun",
  "message.archive": "Mesaj arhivat",
  "message.unarchive": "Mesaj scos din arhivă",
  "message.unread": "Mesaj marcat necitit",
  "message.deleted": "Mesaj șters",
  "page.view": "Pagină deschisă",
};

const PAGE_NAMES: Record<string, string> = {
  "/": "Panou",
  "/login": "Conectare",
  "/login/confirm": "Confirmare conectare",
  "/messages": "Mesaje",
  "/cookies": "Cookie-uri",
  "/settings": "Setări",
  "/security": "Securitate",
  "/journal": "Jurnal",
};

export function activityLabel(action: string, detail: Record<string, unknown> | null): string {
  const base = LABELS[action] ?? action;
  if (action === "login.requested" && detail && detail.matched === false) {
    return "Cerere de conectare cu altă adresă (ignorată)";
  }
  if (action === "page.view" && detail) {
    const path = String(detail.path ?? "");
    const name = PAGE_NAMES[path] ?? (path.startsWith("/messages/") ? "Un mesaj" : path);
    return `${base}: ${name}`;
  }
  if (action === "setting.changed" && detail) {
    return `${base}: ${String(detail.key)} ${detail.value ? "pornită" : "oprită"}`;
  }
  return base;
}

/** Recent actions, without the page views (those live in the journal). */
export async function recentActivity(limit = 30) {
  return db()
    .select()
    .from(schema.adminAuditLog)
    .where(sql`${schema.adminAuditLog.action} <> 'page.view'`)
    .orderBy(desc(schema.adminAuditLog.createdAt))
    .limit(limit);
}

const log = schema.adminAuditLog;

export type JournalFilter = "all" | "logins" | "failed" | "views" | "changes";

const FAILURES = or(
  inArray(log.action, ["login.code_wrong", "login.link_invalid"]),
  and(sql`${log.action} = 'login.requested'`, sql`${log.detail}->>'matched' = 'false'`),
);

const FILTERS: Record<JournalFilter, SQL | undefined> = {
  all: undefined,
  logins: or(
    like(log.action, "login.%"),
    like(log.action, "logout%"),
    like(log.action, "sessions.%"),
  ),
  failed: FAILURES,
  views: sql`${log.action} = 'page.view'`,
  changes: or(like(log.action, "setting.%"), like(log.action, "message.%")),
};

export async function journal(filter: JournalFilter, limit = 200) {
  return db().select().from(log).where(FILTERS[filter]).orderBy(desc(log.createdAt)).limit(limit);
}

/** Last 24 hours at a glance. */
export async function journalStats() {
  const [row] = await db()
    .select({
      views: sql<number>`count(*) filter (where ${log.action} = 'page.view')`,
      requests: sql<number>`count(*) filter (where ${log.action} = 'login.requested')`,
      failures: sql<number>`count(*) filter (where ${FAILURES})`,
      ips: sql<number>`count(distinct ${log.ip})`,
      strangers: sql<number>`count(distinct ${log.ip}) filter (where ${log.sessionId} is null and ${log.ip} not in (select ip from admin_sessions where ip is not null))`,
    })
    .from(log)
    .where(gte(log.createdAt, sql`now() - interval '24 hours'`));
  return {
    views: Number(row?.views ?? 0),
    requests: Number(row?.requests ?? 0),
    failures: Number(row?.failures ?? 0),
    ips: Number(row?.ips ?? 0),
    strangers: Number(row?.strangers ?? 0),
  };
}

/** Every IP address the owner has ever signed in from: used to mark "tu" in the journal. */
export async function ownerIps(): Promise<Set<string>> {
  const rows = await db()
    .selectDistinct({ ip: schema.adminSessions.ip })
    .from(schema.adminSessions)
    .where(isNotNull(schema.adminSessions.ip));
  return new Set(rows.map((r) => r.ip as string));
}
