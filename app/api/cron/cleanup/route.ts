import { NextResponse, type NextRequest } from "next/server";
import { lt, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";

// Deletes what the privacy policy says we keep only for a while. Runs daily (vercel.json);
// Vercel sends `Authorization: Bearer ${CRON_SECRET}` with every scheduled call.
const RETENTION = sql`now() - interval '3 years'`;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const [consent, messages] = await Promise.all([
    db()
      .delete(schema.consentRecords)
      .where(lt(schema.consentRecords.createdAt, RETENTION))
      .returning({ id: schema.consentRecords.id }),
    db()
      .delete(schema.contactMessages)
      .where(lt(schema.contactMessages.receivedAt, RETENTION))
      .returning({ id: schema.contactMessages.id }),
  ]);

  return NextResponse.json({
    ok: true,
    deleted: { consentRecords: consent.length, contactMessages: messages.length },
  });
}
