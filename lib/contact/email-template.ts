// The email the team receives for every contact-form message.
// Table layout and inline styles: the only form all email clients (Gmail, Zoho, Outlook) render reliably.
import { SUSPECT_FROM, type Analysis, type BotSignals, type ContactInput } from "./spam-score.ts";

// Neutral, minimal and technical on purpose: an internal tool email, not part of the site's look.
// Inter and JetBrains Mono load in Apple Mail and some apps; Gmail and Outlook fall back to
// the system fonts in the stack, which keep the same clean look.
const SANS = "Inter, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', Menlo, Consolas, 'Courier New', monospace";
const BG = "#f4f4f5";
const CARD = "#ffffff";
const LINE = "#e4e4e7";
const INK = "#18181b";
const MUTED = "#71717a";
const OK = { bg: "#ecfdf5", ink: "#047857" };
const WARN = { bg: "#fef2f2", ink: "#b91c1c" };

export interface ContactEmailData {
  input: ContactInput;
  analysis: Analysis;
  signals: BotSignals;
  receivedAt: Date;
  location: string;
  mapUrl?: string;
  ip: string;
  device: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatRoDate(date: Date): string {
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Bucharest",
  }).format(date);
}

const DOMAIN_LABEL: Record<BotSignals["emailDomain"], string> = {
  ok: "✓ domeniu valid, primește emailuri",
  invalid: "✗ domeniul nu primește emailuri",
  disposable: "✗ adresă de unică folosință",
  unknown: "? nu s-a putut verifica",
};

const TURNSTILE_LABEL: Record<BotSignals["turnstile"], string> = {
  passed: "✓ trecută",
  failed: "✗ eșuată",
  missing: "✗ lipsă",
  skipped: "— neactivată",
};

export function contactEmailSubject({ input, analysis }: ContactEmailData): string {
  const prefix = analysis.verdict === "suspect" ? "[Posibil spam] " : "";
  return `${prefix}Mesaj de la ${input.name}: ${input.subject}`.slice(0, 200);
}

export function contactEmailHtml(data: ContactEmailData): string {
  const { input, analysis, signals } = data;
  const suspect = analysis.verdict === "suspect";
  const tone = suspect ? WARN : OK;
  const name = escapeHtml(input.name);
  const email = escapeHtml(input.email);
  const subject = escapeHtml(input.subject);
  const message = escapeHtml(input.message).replace(/\n/g, "<br>");
  const replyHref = `mailto:${encodeURIComponent(input.email)}?subject=${encodeURIComponent(`Re: ${input.subject}`)}`;
  const label = `font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};`;

  const row = (key: string, value: string, mono = false) => `
    <tr>
      <td style="padding:10px 0;border-top:1px solid ${LINE};${label}width:96px;vertical-align:top;">${key}</td>
      <td style="padding:10px 0;border-top:1px solid ${LINE};font-family:${mono ? MONO : SANS};font-size:13px;line-height:1.5;color:${INK};">${value}</td>
    </tr>`;

  const reasons = analysis.reasons.filter((r) => r.startsWith("+"));
  const flags = suspect
    ? `
        <tr><td style="padding:0 32px 24px;">
          <div style="background:${WARN.bg};border-radius:8px;padding:14px 16px;">
            <div style="${label}color:${WARN.ink};padding-bottom:6px;">De ce pare spam</div>
            ${reasons
              .map(
                (r) =>
                  `<div style="font-family:${MONO};font-size:12px;line-height:1.7;color:${WARN.ink};">${escapeHtml(r)}</div>`,
              )
              .join("")}
          </div>
        </td></tr>`
    : "";

  const location = `${escapeHtml(data.location)}${
    data.mapUrl ? ` · <a href="${escapeHtml(data.mapUrl)}" style="color:${INK};">hartă</a>` : ""
  }<div style="font-size:12px;color:${MUTED};">aproximativă, după adresa IP</div>`;

  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${subject}</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap');</style>
</head>
<body style="margin:0;padding:0;background:${BG};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding:0 4px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-family:${SANS};font-size:13px;font-weight:600;color:${INK};">Hărți România</td>
            <td align="right" style="font-family:${MONO};font-size:12px;color:${MUTED};">contact / mesaj nou</td>
          </tr></table>
        </td></tr>
        <tr><td style="background:${CARD};border:1px solid ${LINE};border-radius:12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:28px 32px 20px;">
              <span style="display:inline-block;background:${tone.bg};color:${tone.ink};font-family:${SANS};font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;">${suspect ? "Posibil spam" : "Mesaj verificat"} · ${analysis.score}/100</span>
              <h1 style="margin:16px 0 6px;font-family:${SANS};font-size:22px;line-height:1.3;font-weight:600;letter-spacing:-0.01em;color:${INK};">${subject}</h1>
              <div style="font-family:${SANS};font-size:14px;color:${MUTED};">${name} · <a href="mailto:${email}" style="color:${INK};">${email}</a></div>
            </td></tr>
            ${flags}
            <tr><td style="padding:0 32px 24px;">
              <div style="font-family:${SANS};font-size:15px;line-height:1.65;color:${INK};border-left:2px solid ${INK};padding:2px 0 2px 16px;">${message}</div>
            </td></tr>
            <tr><td style="padding:0 32px 28px;">
              <a href="${replyHref}" style="display:inline-block;background:${INK};color:#ffffff;font-family:${SANS};font-size:14px;font-weight:500;text-decoration:none;padding:11px 20px;border-radius:8px;">Răspunde</a>
            </td></tr>
            <tr><td style="padding:0 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${row("Primit", escapeHtml(formatRoDate(data.receivedAt)))}
                ${row("Locație", location)}
                ${row("IP", escapeHtml(data.ip), true)}
                ${row("Dispozitiv", escapeHtml(data.device))}
                ${row("Email", DOMAIN_LABEL[signals.emailDomain])}
                ${row("Anti-bot", TURNSTILE_LABEL[signals.turnstile])}
                ${row("Scor", `${analysis.score}/100 · prag ${SUSPECT_FROM}`, true)}
              </table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:16px 4px 0;font-family:${SANS};font-size:12px;line-height:1.5;color:${MUTED};">
          Trimis automat din formularul de contact hartiromania.ro. „Reply” răspunde direct expeditorului.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function contactEmailText(data: ContactEmailData): string {
  const { input, analysis, signals } = data;
  return [
    analysis.verdict === "suspect" ? `POSIBIL SPAM (scor ${analysis.score}/100)\n` : "",
    `${input.subject}`,
    `de la ${input.name} <${input.email}>`,
    "",
    input.message,
    "",
    `Primit: ${formatRoDate(data.receivedAt)}`,
    `Locație: ${data.location} (aproximativă, după IP)${data.mapUrl ? ` ${data.mapUrl}` : ""}`,
    `Adresă IP: ${data.ip}`,
    `Dispozitiv: ${data.device}`,
    `Email: ${DOMAIN_LABEL[signals.emailDomain]}`,
    `Anti-bot: ${TURNSTILE_LABEL[signals.turnstile]}`,
    `Scor spam: ${analysis.score}/100`,
  ].join("\n");
}
