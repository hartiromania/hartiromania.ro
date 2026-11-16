/**
 * Helper pentru token-uri de dezabonare semnate HMAC-SHA256.
 *
 * Folosit pentru link-urile "Dezabonează-te" din email-urile de newsletter.
 * Token-ul include email-ul abonatului (codat) și o semnătură HMAC care nu
 * poate fi forgeruită fără secret-ul UNSUBSCRIBE_TOKEN_SECRET.
 *
 * Format token: `<base64url(email)>.<base64url(hmac)>`
 *
 * Verificarea NU expiră — dezabonarea trebuie să funcționeze și după luni.
 * Dacă vreodată vrem revocare bulk, schimbăm UNSUBSCRIBE_TOKEN_SECRET și
 * toate token-urile vechi devin invalide instant.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

function base64UrlEncode(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf, "utf8") : buf;
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(normalized, "base64");
}

function getSecret(): string {
  const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "UNSUBSCRIBE_TOKEN_SECRET nu e setat sau e prea scurt (min. 16 chars). Adaugă-l în Vercel env vars.",
    );
  }
  return secret;
}

/**
 * Generează un token de dezabonare pentru emailul dat.
 * Email-ul e normalizat (lowercase, trim) înainte de semnare.
 */
export function signUnsubscribeToken(email: string): string {
  const normalized = email.toLowerCase().trim();
  const secret = getSecret();
  const sig = createHmac("sha256", secret).update(normalized).digest();
  return `${base64UrlEncode(normalized)}.${base64UrlEncode(sig)}`;
}

/**
 * Verifică un token. Returnează email-ul dacă e valid, null altfel.
 */
export function verifyUnsubscribeToken(token: string): string | null {
  if (typeof token !== "string" || !token.includes(".")) return null;

  const [emailPart, sigPart] = token.split(".", 2);
  if (!emailPart || !sigPart) return null;

  let email: string;
  let providedSig: Buffer;
  try {
    email = base64UrlDecode(emailPart).toString("utf8");
    providedSig = base64UrlDecode(sigPart);
  } catch {
    return null;
  }

  if (!email || !email.includes("@")) return null;

  const secret = getSecret();
  const expectedSig = createHmac("sha256", secret).update(email).digest();

  if (providedSig.length !== expectedSig.length) return null;
  if (!timingSafeEqual(providedSig, expectedSig)) return null;

  return email;
}

/**
 * Construiește URL-ul absolut de dezabonare pentru un email dat.
 * Folosește NEXT_PUBLIC_SITE_URL dacă e setat, altfel hartiromania.ro hardcoded.
 */
export function buildUnsubscribeUrl(email: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.hartiromania.ro";
  const token = signUnsubscribeToken(email);
  return `${baseUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}
