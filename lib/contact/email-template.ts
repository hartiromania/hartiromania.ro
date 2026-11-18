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
const PLACE = { bg: "#eff6ff", ink: "#1d4ed8" };

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

// The quoted message is cut here so the reply link stays short enough for Zoho to open.
const QUOTE_MAX = 1500;

// "Răspunde" opens a new email to the sender with their message quoted as a small card
// below the space for the answer, so the reply does not carry this whole notification
// along (as the mail client's Reply would). Zoho's compose window reads the body as HTML.
// The card is part of the email the customer receives, so it is written for them too.
function replyMailto({ input, receivedAt }: ContactEmailData): string {
  const text =
    input.message.length > QUOTE_MAX ? `${input.message.slice(0, QUOTE_MAX)}…` : input.message;
  const body = [
    "<p><br></p><p><br></p><p><br></p>",
    `<div style="margin-top:24px;max-width:560px;border:1px solid ${LINE};border-radius:12px;padding:18px 20px;font-family:${SANS};">`,
    `<div style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Mesaj trimis prin hartiromania.ro</div>`,
    `<div style="font-size:13px;color:${MUTED};padding-top:4px;">${escapeHtml(input.name)} · ${escapeHtml(formatRoDate(receivedAt))}</div>`,
    `<div style="font-size:16px;font-weight:600;color:${INK};padding:14px 0 8px;">${escapeHtml(input.subject)}</div>`,
    `<div style="border-left:2px solid ${INK};padding-left:14px;font-size:14px;line-height:1.6;color:#3f3f46;">${escapeHtml(text).replace(/\n/g, "<br>")}</div>`,
    "</div>",
  ].join("");
  return `mailto:${encodeURIComponent(input.email)}?subject=${encodeURIComponent(`Re: ${input.subject}`)}&body=${encodeURIComponent(body)}`;
}

export function contactEmailHtml(data: ContactEmailData): string {
  const { input, analysis, signals } = data;
  const suspect = analysis.verdict === "suspect";
  const tone = suspect ? WARN : OK;
  const name = escapeHtml(input.name);
  const email = escapeHtml(input.email);
  const subject = escapeHtml(input.subject);
  const message = escapeHtml(input.message).replace(/\n/g, "<br>");
  // Opens Zoho Mail's compose window directly (the address Zoho itself uses for mailto
  // links), so it works without setting Zoho as the browser's mail handler.
  const replyHref = `https://mail.zoho.eu/zm/comp.do?ct=${encodeURIComponent(replyMailto(data))}`;
  const label = `font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};`;

  const row = (key: string, value: string, mono = false) => `
    <tr>
      <td style="padding:10px 0;border-top:1px solid ${LINE};${label}width:96px;vertical-align:top;">${key}</td>
      <td style="padding:10px 0;border-top:1px solid ${LINE};font-family:${mono ? MONO : SANS};font-size:13px;line-height:1.5;color:${INK};">${value}</td>
    </tr>`;

  const chip = (text: string, colors: { bg: string; ink: string }) =>
    `<span style="display:inline-block;background:${colors.bg};color:${colors.ink};font-weight:600;padding:2px 8px;border-radius:6px;">${text}</span>`;
  const location = `${chip(escapeHtml(data.location), PLACE)}${
    data.mapUrl ? ` <a href="${escapeHtml(data.mapUrl)}" style="color:${INK};">hartă</a>` : ""
  }<div style="font-size:12px;color:${MUTED};padding-top:4px;">aproximativă, după adresa IP</div>`;

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
                ${row("Anti-bot", TURNSTILE_LABEL[signals.turnstile])}
                ${row("Scor", `${chip(`${analysis.score}/100`, tone)} <span style="color:${MUTED};">prag ${SUSPECT_FROM}</span>`, true)}
              </table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:16px 4px 0;font-family:${SANS};font-size:12px;line-height:1.5;color:${MUTED};">
          Trimis automat din formularul de contact hartiromania.ro. „Răspunde” deschide un email nou către expeditor, cu mesajul lui citat.
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
    `Anti-bot: ${TURNSTILE_LABEL[signals.turnstile]}`,
    `Scor spam: ${analysis.score}/100`,
  ].join("\n");
}
