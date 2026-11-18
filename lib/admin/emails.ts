// Emails of the admin sign-in, in the same minimal style as the contact notification.
import "server-only";

import { Resend } from "resend";

import {
  BG,
  CARD,
  escapeHtml,
  formatRoDate,
  INK,
  LINE,
  MONO,
  MUTED,
  SANS,
} from "@/lib/contact/email-template";
import { ADMIN_EMAIL } from "./auth";

const FROM = "Admin Hărți România <sent@hartiromania.ro>";

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${BG};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="padding:0 4px 12px;font-family:${SANS};font-size:13px;font-weight:600;color:${INK};">Hărți România <span style="font-family:${MONO};font-weight:400;color:${MUTED};">/ admin</span></td></tr>
<tr><td style="background:${CARD};border:1px solid ${LINE};border-radius:12px;padding:28px 32px;font-family:${SANS};color:${INK};">${body}</td></tr>
<tr><td style="padding:16px 4px 0;font-family:${SANS};font-size:12px;line-height:1.5;color:${MUTED};">Dacă nu tu ai cerut acest email, îl poți ignora: nimeni nu intră fără link sau cod.</td></tr>
</table></td></tr></table></body></html>`;
}

async function send(subject: string, html: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY lipsește");
  const { error } = await new Resend(apiKey).emails.send({
    from: FROM,
    to: [ADMIN_EMAIL],
    subject,
    html,
    text,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendLoginEmail(input: {
  link: string;
  code: string;
  location: string;
  device: string;
}) {
  const code = escapeHtml(input.code);
  const html = layout(
    "Conectare la admin",
    `<h1 style="margin:0 0 8px;font-size:20px;font-weight:600;">Conectare la admin</h1>
<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${MUTED};">Apasă butonul sau scrie codul în pagina de conectare. Ambele expiră în 10 minute și merg o singură dată.</p>
<a href="${escapeHtml(input.link)}" style="display:inline-block;background:${INK};color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;padding:11px 20px;border-radius:8px;">Conectează-mă</a>
<div style="margin:24px 0 6px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Sau codul</div>
<div style="font-family:${MONO};font-size:28px;letter-spacing:0.3em;font-weight:600;">${code}</div>
<div style="margin-top:24px;padding-top:16px;border-top:1px solid ${LINE};font-size:12px;line-height:1.6;color:${MUTED};">Cerut de pe ${escapeHtml(input.device)} · ${escapeHtml(input.location)}</div>`,
  );
  const text = `Conectare la admin Hărți România\n\nLink: ${input.link}\nCod: ${input.code}\n\nExpiră în 10 minute și merg o singură dată.\nCerut de pe ${input.device} · ${input.location}`;
  await send(`Codul tău de conectare: ${input.code}`, html, text);
}

export async function sendNewSignInEmail(input: { location: string; device: string; ip: string }) {
  const html = layout(
    "Conectare nouă în admin",
    `<h1 style="margin:0 0 8px;font-size:20px;font-weight:600;">Conectare nouă în admin</h1>
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${MUTED};">Cineva s-a conectat chiar acum. Dacă nu ai fost tu, intră în admin la „Securitate” și deconectează celelalte sesiuni.</p>
<div style="font-size:13px;line-height:1.8;">${escapeHtml(formatRoDate(new Date()))}<br>${escapeHtml(input.device)}<br>${escapeHtml(input.location)} · <span style="font-family:${MONO};">${escapeHtml(input.ip)}</span></div>`,
  );
  const text = `Conectare nouă în admin: ${formatRoDate(new Date())}, ${input.device}, ${input.location}, ${input.ip}`;
  await send("Conectare nouă în admin", html, text);
}
