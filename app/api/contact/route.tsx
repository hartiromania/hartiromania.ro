import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import {
  checkEmailDomain,
  isRateLimited,
  storeMessage,
  verifyTurnstile,
} from "@/lib/contact/checks";
import {
  contactEmailHtml,
  contactEmailSubject,
  contactEmailText,
  type ContactEmailData,
} from "@/lib/contact/email-template";
import { analyzeMessage, type BotSignals, type ContactInput } from "@/lib/contact/spam-score";
import { deviceOf, visitorOf } from "@/lib/request-info";

const LIMITS = { name: 100, email: 200, subject: 200, message: 5000 } as const;
const EMAIL_SYNTAX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  // The client is created per request: the build runs without RESEND_API_KEY,
  // and the Resend constructor throws without a key.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY lipsește");
    return NextResponse.json({ error: "Eroare internă de server" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă" }, { status: 400 });
  }

  const input: ContactInput = {
    name: text(body.name, LIMITS.name),
    email: text(body.email, LIMITS.email),
    subject: text(body.subject, LIMITS.subject),
    message: text(body.message, LIMITS.message),
  };
  if (!input.name || !input.email || !input.subject || !input.message) {
    return NextResponse.json({ error: "Toate câmpurile sunt obligatorii" }, { status: 400 });
  }
  if (!EMAIL_SYNTAX.test(input.email)) {
    return NextResponse.json({ error: "Adresa de email nu este validă" }, { status: 400 });
  }

  const visitor = visitorOf(request.headers);
  const ip = visitor.ip;
  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Ați trimis prea multe mesaje. Încercați din nou peste câteva minute." },
      { status: 429 },
    );
  }

  const [turnstile, emailDomain] = await Promise.all([
    verifyTurnstile(text(body.turnstileToken, 2048) || undefined, ip),
    checkEmailDomain(input.email),
  ]);
  const signals: BotSignals = {
    honeypot: text(body.website, 200).length > 0,
    elapsedMs: typeof body.elapsedMs === "number" ? body.elapsedMs : null,
    turnstile,
    emailDomain,
  };
  const analysis = analyzeMessage(input, signals);

  const data: ContactEmailData = {
    input,
    analysis,
    signals,
    receivedAt: new Date(),
    location: visitor.location,
    mapUrl: visitor.mapUrl,
    ip: ip ?? "necunoscut",
    device: deviceOf(request.headers.get("user-agent")),
  };

  // Every message is delivered, suspect ones included (only labelled), so nothing is lost.
  const { error } = await new Resend(apiKey).emails.send({
    from: "Formular Contact Hărți România <sent@hartiromania.ro>",
    to: ["contact@hartiromania.ro"],
    replyTo: input.email,
    subject: contactEmailSubject(data),
    html: contactEmailHtml(data),
    text: contactEmailText(data),
  });
  if (error) console.error("Resend error:", error);

  await storeMessage({
    receivedAt: data.receivedAt.toISOString(),
    ...input,
    verdict: analysis.verdict,
    score: analysis.score,
    reasons: analysis.reasons,
    location: data.location,
    ip: data.ip,
    device: data.device,
    emailed: !error,
  });

  if (error && analysis.verdict === "ok") {
    return NextResponse.json({ error: "Eroare la trimiterea emailului" }, { status: 500 });
  }
  // A bot gets the same answer as a person, so it learns nothing about the filter.
  return NextResponse.json({ message: "Mesajul a fost trimis cu succes!" }, { status: 200 });
}
