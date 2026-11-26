// Cookie choices for the admin: how many visitors accept statistics, and the proof log.
import "server-only";

import { desc, eq, gte, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";

const records = schema.consentRecords;

/** Latest choice of every visitor (consent ID) seen in the last `days` days. */
export async function consentStats(days = 30) {
  const latest = db()
    .selectDistinctOn([records.consentId], {
      statistics: records.statistics,
      source: records.source,
    })
    .from(records)
    .where(gte(records.createdAt, sql`now() - make_interval(days => ${days})`))
    .orderBy(records.consentId, desc(records.createdAt))
    .as("latest");

  const [row] = await db()
    .select({
      visitors: sql<number>`count(*)`,
      accepted: sql<number>`count(*) filter (where ${latest.statistics})`,
      changed: sql<number>`count(*) filter (where ${latest.source} = 'settings')`,
    })
    .from(latest);

  const visitors = Number(row?.visitors ?? 0);
  const accepted = Number(row?.accepted ?? 0);
  return {
    visitors,
    accepted,
    refused: visitors - accepted,
    changed: Number(row?.changed ?? 0),
    rate: visitors ? Math.round((accepted / visitors) * 100) : 0,
  };
}

/** Newest records first; with a consent ID, only that visitor's history. */
export async function consentLog(consentId?: string, limit = 200) {
  return db()
    .select()
    .from(records)
    .where(consentId ? eq(records.consentId, consentId) : undefined)
    .orderBy(desc(records.createdAt))
    .limit(limit);
}
