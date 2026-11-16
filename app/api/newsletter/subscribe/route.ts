import { type NextRequest, NextResponse } from "next/server";

const MAILERLITE_API_BASE = "https://connect.mailerlite.com/api";
const MAILERLITE_API_URL = `${MAILERLITE_API_BASE}/subscribers`;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Verifică în prealabil dacă emailul există în MailerLite și e DEJA în grupul nostru.
 * Returnează:
 *   - existsInGroup: true dacă subscriber-ul există și e activ în grupul nostru
 *     (deci re-submit-ul ar fi un duplicat — afișăm "Ești deja abonat")
 *   - false în orice alt caz: nu există / există dar nu e în grup / există dar e
 *     unsubscribed → tratăm POST-ul ulterior ca subscribe nou
 *
 * Implementarea ignoră silent erorile (timeout, 5xx etc.) — nu blocăm flow-ul
 * de subscribe pentru un check pre-flight. La eroare returnăm false → user-ul
 * primește mesajul "Mulțumim, ești abonat" (sigur și prietenos).
 */
async function isAlreadyActiveInGroup(input: {
  apiKey: string;
  email: string;
  groupId: string;
}): Promise<boolean> {
  try {
    const response = await fetch(
      `${MAILERLITE_API_BASE}/subscribers/${encodeURIComponent(input.email)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${input.apiKey}`,
          Accept: "application/json",
        },
      },
    );
    if (!response.ok) return false;

    const data = (await response.json()) as {
      data?: {
        status?: string;
        groups?: Array<{ id?: string | number }>;
      };
    };
    if (data?.data?.status !== "active") return false;

    const groups = data?.data?.groups || [];
    return groups.some((g) => String(g.id) === String(input.groupId));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.MAILERLITE_API_KEY;
    const groupId = process.env.MAILERLITE_GROUP_ID;

    if (!apiKey || !groupId) {
      console.error("[newsletter] Missing MAILERLITE_API_KEY or MAILERLITE_GROUP_ID env vars");
      return NextResponse.json(
        { error: "Configurarea newsletter-ului este incompletă. Te rugăm să încerci mai târziu." },
        { status: 500 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const source = typeof body.source === "string" ? body.source.trim() : "unknown";

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Adresa de email nu pare validă." }, { status: 400 });
    }

    if (email.length > 200 || name.length > 100) {
      return NextResponse.json({ error: "Datele introduse sunt prea lungi." }, { status: 400 });
    }

    // Check pre-flight: era deja activ ÎN GRUPUL NOSTRU înainte de POST?
    // Asta deosebește "user complet nou" / "user re-abonat după dezabonare" (ambele
    // primesc "Mulțumim!") de "user care apasă submit pe form fără să se schimbe nimic"
    // (primește "Ești deja abonat").
    const wasAlreadyInGroup = await isAlreadyActiveInGroup({ apiKey, email, groupId });

    const payload: Record<string, unknown> = {
      email,
      groups: [groupId],
      status: "active",
      fields: {
        ...(name ? { name } : {}),
        signup_source: source,
      },
    };

    const response = await fetch(MAILERLITE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 201 || response.status === 200) {
      return NextResponse.json(
        {
          success: true,
          message: wasAlreadyInGroup
            ? "Ești deja abonat la newsletter. Mulțumim pentru interes!"
            : "Mulțumim! Ești acum abonat la newsletter-ul Hărți România.",
          alreadyExists: wasAlreadyInGroup,
        },
        { status: 200 },
      );
    }

    if (response.status === 422) {
      const errorData = await response.json().catch(() => null);
      console.warn("[newsletter] Validation error from MailerLite:", errorData);
      return NextResponse.json(
        { error: "Te rugăm să verifici adresa de email și să încerci din nou." },
        { status: 400 },
      );
    }

    if (response.status === 401 || response.status === 403) {
      console.error("[newsletter] Auth error with MailerLite — check MAILERLITE_API_KEY");
      return NextResponse.json(
        { error: "Configurarea newsletter-ului este momentan indisponibilă." },
        { status: 500 },
      );
    }

    const errorText = await response.text().catch(() => "");
    console.error(`[newsletter] Unexpected MailerLite response: ${response.status}`, errorText);
    return NextResponse.json(
      { error: "A apărut o eroare. Te rugăm să încerci din nou mai târziu." },
      { status: 500 },
    );
  } catch (error) {
    console.error("[newsletter] Unexpected error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare. Te rugăm să încerci din nou mai târziu." },
      { status: 500 },
    );
  }
}
