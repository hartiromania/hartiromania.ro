// The email the team receives for every contact-form message.
// Table layout and inline styles: the only form all email clients (Gmail, Zoho, Outlook) render reliably.
import type { Analysis, BotSignals, ContactInput } from "./spam-score";

const ORANGE = "#a0501a";
const FRAME = "#d2691e";
const CREAM = "#faf5eb";
const PAPER = "#fffdf8";
const INK = "#1a1a1a";
const MUTED = "#6b6255";
const WARN_BG = "#fdecea";
const WARN_INK = "#8a1f11";
const SERIF = "Georgia, 'Times New Roman', serif";

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
  const name = escapeHtml(input.name);
  const email = escapeHtml(input.email);
  const subject = escapeHtml(input.subject);
  const message = escapeHtml(input.message).replace(/\n/g, "<br>");
  const replyHref = `mailto:${encodeURIComponent(input.email)}?subject=${encodeURIComponent(`Re: ${input.subject}`)}`;

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;color:${MUTED};font-size:14px;width:110px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;color:${INK};font-size:14px;">${value}</td>
    </tr>`;

  const warning = suspect
    ? `
    <tr><td style="padding:0 32px 8px;">
      <div style="background:${WARN_BG};border-left:4px solid ${WARN_INK};padding:14px 16px;color:${WARN_INK};font-size:14px;line-height:1.5;">
        <strong>Posibil spam (scor ${analysis.score}/100).</strong> Verifică mesajul înainte să răspunzi.
        <ul style="margin:8px 0 0;padding-left:18px;">${analysis.reasons
          .filter((r) => r.startsWith("+"))
          .map((r) => `<li>${escapeHtml(r)}</li>`)
          .join("")}</ul>
      </div>
    </td></tr>`
    : "";

  return `<!doctype html>
<html lang="ro">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:${CREAM};font-family:${SERIF};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${PAPER};border:3px double ${FRAME};">
        <tr><td style="padding:24px 32px 8px;">
          <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${ORANGE};">Hărți România · formular de contact</div>
          <h1 style="margin:8px 0 0;font-size:24px;line-height:1.3;color:${INK};font-weight:normal;">${subject}</h1>
          <p style="margin:6px 0 0;font-size:15px;color:${MUTED};">de la <strong style="color:${INK};">${name}</strong> · <a href="mailto:${email}" style="color:${ORANGE};">${email}</a></p>
        </td></tr>
        ${warning}
        <tr><td style="padding:12px 32px;">
          <div style="background:#ffffff;border:1px solid #e8dcc6;padding:18px 20px;font-size:16px;line-height:1.6;color:${INK};">${message}</div>
        </td></tr>
        <tr><td style="padding:8px 32px 0;" align="left">
          <a href="${replyHref}" style="display:inline-block;background:${ORANGE};color:#ffffff;text-decoration:none;padding:12px 22px;font-size:15px;">Răspunde lui ${name}</a>
        </td></tr>
        <tr><td style="padding:20px 32px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e8dcc6;">
            ${row("Primit", escapeHtml(formatRoDate(data.receivedAt)))}
            ${row(
              "Locație",
              `${escapeHtml(data.location)}${
                data.mapUrl
                  ? ` · <a href="${escapeHtml(data.mapUrl)}" style="color:${ORANGE};">vezi pe hartă</a>`
                  : ""
              }<br><span style="color:${MUTED};font-size:12px;">aproximativă, după adresa IP</span>`,
            )}
            ${row("Adresă IP", escapeHtml(data.ip))}
            ${row("Dispozitiv", escapeHtml(data.device))}
            ${row("Email", DOMAIN_LABEL[signals.emailDomain])}
            ${row("Anti-bot", TURNSTILE_LABEL[signals.turnstile])}
            ${row("Scor spam", `${analysis.score}/100 · ${suspect ? "suspect" : "în regulă"}`)}
          </table>
        </td></tr>
        <tr><td style="padding:12px 32px 24px;color:${MUTED};font-size:12px;line-height:1.5;">
          Trimis prin formularul de contact de pe hartiromania.ro. „Reply” răspunde direct expeditorului.
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
