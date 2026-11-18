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

const LIMITS = { name: 100, email: 200, subject: 200, message: 5000 } as const;
const EMAIL_SYNTAX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Romanian counties by their ISO 3166-2 code (what Vercel sends as the region).
const RO_COUNTIES: Record<string, string> = {
  AB: "Alba",
  AR: "Arad",
  AG: "Argeș",
  BC: "Bacău",
  BH: "Bihor",
  BN: "Bistrița-Năsăud",
  BT: "Botoșani",
  BV: "Brașov",
  BR: "Brăila",
  B: "București",
  BZ: "Buzău",
  CS: "Caraș-Severin",
  CL: "Călărași",
  CJ: "Cluj",
  CT: "Constanța",
  CV: "Covasna",
  DB: "Dâmbovița",
  DJ: "Dolj",
  GL: "Galați",
  GR: "Giurgiu",
  GJ: "Gorj",
  HR: "Harghita",
  HD: "Hunedoara",
  IL: "Ialomița",
  IS: "Iași",
  IF: "Ilfov",
  MM: "Maramureș",
  MH: "Mehedinți",
  MS: "Mureș",
  NT: "Neamț",
  OT: "Olt",
  PH: "Prahova",
  SM: "Satu Mare",
  SJ: "Sălaj",
  SB: "Sibiu",
  SV: "Suceava",
  TR: "Teleorman",
  TM: "Timiș",
  TL: "Tulcea",
  VS: "Vaslui",
  VL: "Vâlcea",
  VN: "Vrancea",
};

const COUNTRY_NAMES = new Intl.DisplayNames(["ro"], { type: "region" });

// The visitor's real IP and its location, as resolved by Vercel's network. Vercel
// overwrites these headers itself, so a visitor cannot fake them. Locally they are missing.
function visitorOf(request: NextRequest) {
  const header = (name: string) => {
    const value = request.headers.get(name);
    return value ? decodeURIComponent(value) : "";
  };
  const ip = header("x-real-ip") || header("x-forwarded-for").split(",")[0].trim() || undefined;
  const country = header("x-vercel-ip-country");
  const region = header("x-vercel-ip-country-region");
  const county = country === "RO" ? RO_COUNTIES[region] : region;
  const parts = [
    header("x-vercel-ip-city"),
    county && country === "RO" && county !== "București" ? `jud. ${county}` : county,
    country ? COUNTRY_NAMES.of(country) : "",
  ].filter((part, i, all) => part && all.indexOf(part) === i);
  const lat = header("x-vercel-ip-latitude");
  const lon = header("x-vercel-ip-longitude");
  return {
    ip,
    location: parts.length ? parts.join(", ") : "necunoscută",
    mapUrl: lat && lon ? `https://www.google.com/maps?q=${lat},${lon}` : undefined,
  };
}

function deviceOf(userAgent: string | null): string {
  if (!userAgent) return "necunoscut";
  const os = /iPhone|iPad/.test(userAgent)
    ? "iPhone/iPad"
    : /Android/.test(userAgent)
      ? "Android"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Mac OS X/.test(userAgent)
          ? "Mac"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "alt sistem";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Chrome\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : "alt browser";
  const mobile = /Mobi|Android|iPhone/.test(userAgent) ? "telefon" : "calculator";
  return `${browser} pe ${os} (${mobile})`;
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

  const visitor = visitorOf(request);
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
