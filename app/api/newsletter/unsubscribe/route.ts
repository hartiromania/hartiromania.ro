import { type NextRequest } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";
import { unsubscribeByEmail } from "@/lib/mailerlite-subscribers";

/**
 * Endpoint pentru dezabonare via link semnat HMAC din email-uri.
 *
 * Flow:
 *   1. Click pe "Dezabonează-te" din email →
 *      GET /api/newsletter/unsubscribe?token=<base64.base64>
 *   2. Verificăm token-ul (HMAC valid → extragem email)
 *   3. Apelăm MailerLite API ca să marcăm subscriber-ul ca "unsubscribed"
 *   4. Returnăm o pagină HTML simplă de confirmare în limba română
 *
 * Răspunsuri:
 *   - 200 + HTML success  → dezabonare reușită (sau era deja unsubscribed)
 *   - 400 + HTML eroare   → token invalid sau lipsește
 *   - 500 + HTML eroare   → MailerLite API down sau env vars lipsă
 *
 * Suportă și **POST** pentru "One-Click Unsubscribe" (RFC 8058) — Gmail
 * folosește header-ul `List-Unsubscribe-Post` ca să facă unsubscribe
 * automat când userul dă click pe linkul nativ Gmail din top-ul emailului.
 */

export const dynamic = "force-dynamic";

async function handleUnsubscribe(request: NextRequest, method: "GET" | "POST") {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return htmlResponse(400, errorPage("Linkul de dezabonare este incomplet sau invalid."));
  }

  const email = verifyUnsubscribeToken(token);
  if (!email) {
    return htmlResponse(400, errorPage("Linkul de dezabonare este invalid sau a fost modificat."));
  }

  const apiKey = process.env.MAILERLITE_API_KEY;
  const groupId = process.env.MAILERLITE_GROUP_ID;
  if (!apiKey || !groupId) {
    console.error("[unsubscribe] Lipsește MAILERLITE_API_KEY sau MAILERLITE_GROUP_ID");
    return htmlResponse(
      500,
      errorPage("Eroare de configurare. Te rugăm să încerci din nou mai târziu."),
    );
  }

  try {
    const result = await unsubscribeByEmail({ apiKey, email, groupId });

    // Pentru POST (One-Click Unsubscribe) Gmail așteaptă doar 200, fără HTML
    if (method === "POST") {
      return new Response(null, { status: 200 });
    }

    return htmlResponse(200, successPage(email, result.alreadyUnsubscribed));
  } catch (error) {
    console.error("[unsubscribe] Eroare la apelul MailerLite:", error);
    return htmlResponse(
      500,
      errorPage(
        "A apărut o eroare la procesarea cererii. Te rugăm să încerci din nou peste câteva minute sau să ne scrii la contact@hartiromania.ro.",
      ),
    );
  }
}

export async function GET(request: NextRequest) {
  return handleUnsubscribe(request, "GET");
}

export async function POST(request: NextRequest) {
  return handleUnsubscribe(request, "POST");
}

function htmlResponse(status: number, html: string): Response {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function basePage(bodyHtml: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>${title} — Hărți România</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
      background-color: #faf5eb;
      color: #1a1a1a;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      max-width: 560px;
      width: 100%;
      margin: 24px;
      padding: 48px 32px;
      background-color: #ffffff;
      border: 1px solid #e7dcc4;
      text-align: center;
    }
    h1 {
      margin: 0 0 16px 0;
      color: #d2691e;
      font-size: 32px;
      font-weight: 700;
      line-height: 1.2;
    }
    p {
      margin: 0 0 16px 0;
      font-size: 18px;
      line-height: 1.6;
      color: #1a1a1a;
    }
    .email {
      display: inline-block;
      padding: 4px 10px;
      background-color: #faf5eb;
      border-radius: 4px;
      font-size: 16px;
      color: #6b6b6b;
    }
    a.btn {
      display: inline-block;
      margin-top: 24px;
      padding: 12px 32px;
      background-color: #d2691e;
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      border-radius: 4px;
    }
    a.btn:hover { background-color: #b35817; }
    .footer-note {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e7dcc4;
      font-size: 14px;
      color: #6b6b6b;
    }
    .footer-note a { color: #d2691e; text-decoration: underline; }
  </style>
</head>
<body>
  <main class="container">
    ${bodyHtml}
  </main>
</body>
</html>`;
}

function successPage(email: string, alreadyUnsubscribed: boolean): string {
  const safeEmail = escapeHtml(email);
  const heading = alreadyUnsubscribed ? "Ești deja dezabonat" : "Te-ai dezabonat cu succes";
  const intro = alreadyUnsubscribed
    ? `Adresa <span class="email">${safeEmail}</span> nu mai e abonată la newsletter-ul Hărți România.`
    : `Adresa <span class="email">${safeEmail}</span> a fost scoasă din lista de newsletter.`;

  return basePage(
    `
    <h1>${heading}</h1>
    <p>${intro}</p>
    <p>Ne pare rău că pleci. Dacă ai dat din greșeală sau te răzgândești, te poți reabona oricând de pe site.</p>
    <a href="https://www.hartiromania.ro" class="btn">Înapoi la hartiromania.ro</a>
    <div class="footer-note">
      Ai întrebări? Scrie-ne la <a href="mailto:contact@hartiromania.ro">contact@hartiromania.ro</a>
    </div>
    `,
    heading,
  );
}

function errorPage(message: string): string {
  return basePage(
    `
    <h1>Eroare</h1>
    <p>${escapeHtml(message)}</p>
    <a href="https://www.hartiromania.ro" class="btn">Înapoi la hartiromania.ro</a>
    <div class="footer-note">
      Dacă vrei să te dezabonezi manual, scrie-ne la <a href="mailto:contact@hartiromania.ro">contact@hartiromania.ro</a> și te ștergem noi din listă.
    </div>
    `,
    "Eroare la dezabonare",
  );
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
