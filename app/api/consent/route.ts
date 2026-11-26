import { NextResponse, type NextRequest } from "next/server";

import { CONSENT_VERSION, isConsentId, type ConsentSource } from "@/lib/consent";
import { overLimit } from "@/lib/contact/checks";
import { db, schema } from "@/lib/db";
import { deviceOf, maskIp, visitorOf } from "@/lib/request-info";

const SOURCES: ConsentSource[] = ["banner", "settings"];

// Records a cookie choice as proof of consent. Answers 204 whatever happens, so the
// banner never waits on it and a bot learns nothing from the response.
export async function POST(request: NextRequest) {
  const done = new NextResponse(null, { status: 204 });

  // Only the site's own pages send this.
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return done;

  const { ip, location } = visitorOf(request.headers);
  if (ip && (await overLimit(`consent:rate:${ip}`, 30, 3600))) return done;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (
    !body ||
    !isConsentId(body.id) ||
    typeof body.statistics !== "boolean" ||
    body.version !== CONSENT_VERSION ||
    !SOURCES.includes(body.source as ConsentSource)
  ) {
    return done;
  }

  try {
    await db()
      .insert(schema.consentRecords)
      .values({
        consentId: body.id,
        statistics: body.statistics,
        version: CONSENT_VERSION,
        source: body.source as ConsentSource,
        page: typeof body.page === "string" ? body.page.slice(0, 200) : null,
        ipMasked: maskIp(ip),
        location,
        device: deviceOf(request.headers.get("user-agent")),
      });
  } catch (error) {
    console.error("[consent] record failed", error);
  }
  return done;
}
