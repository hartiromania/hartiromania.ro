/**
 * Template HTML pentru emailul de notificare "postare nouă pe blog".
 *
 * Replică designul fostei campanii RSS din MailerLite:
 * - Body cream/beige
 * - Card alb cu logo + titlu portocaliu + articol + semnătură + social
 * - Footer portocaliu cu detalii brand + GDPR + unsubscribe
 *
 * Acum trimitem prin Resend (nu mai MailerLite Campaigns API, care necesită
 * Advanced plan). URL-ul de dezabonare e construit per abonat folosind
 * `buildUnsubscribeUrl(email)` din `lib/unsubscribe-token.ts` și injectat
 * în template ca `unsubscribeUrl`.
 */

import { SITE_URL } from "@/lib/site";
const LOGO_URL = `${SITE_URL}/logo-principal-no-bg-cropped.png`;

const SOCIAL_LINKS = [
  // Prima iconiță = link către blog (în MailerLite block era iconița de feed/blog, link la pagina /blog)
  { name: "Blog", url: `${SITE_URL}/blog`, icon: "rss" },
  {
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61580871537631",
    icon: "facebook",
  },
  { name: "Instagram", url: "https://www.instagram.com/hartiromania/", icon: "instagram" },
  { name: "X", url: "https://x.com/HartiRomania", icon: "x" },
  { name: "Telegram", url: "https://t.me/hartiromania", icon: "telegram" },
  { name: "TikTok", url: "https://www.tiktok.com/@hartiromania", icon: "tiktok" },
] as const;

// Iconițe sociale servite TOATE de simpleicons.org (alb pe transparent),
// puse pe pătrat negru via CSS. Compatibile cu toate clientii email.
// Prima iconiță (blog) folosește logo-ul BookStack (stivă de cărți) —
// cea mai apropiată de o "carte/articol" generică din simpleicons,
// reprezintă bine ideea de blog/articole. Linkează la /blog.
const SOCIAL_ICONS: Record<string, string> = {
  rss: "https://cdn.simpleicons.org/bookstack/ffffff",
  facebook: "https://cdn.simpleicons.org/facebook/ffffff",
  instagram: "https://cdn.simpleicons.org/instagram/ffffff",
  x: "https://cdn.simpleicons.org/x/ffffff",
  telegram: "https://cdn.simpleicons.org/telegram/ffffff",
  tiktok: "https://cdn.simpleicons.org/tiktok/ffffff",
};

const ORANGE = "#d2691e";
const CREAM = "#faf5eb";
const TEXT_DARK = "#1a1a1a";
const TEXT_MUTED = "#6b6b6b";
const ICON_BG = "#1a1a1a";

export interface BlogNewsletterTemplateData {
  /** Titlul articolului */
  title: string;
  /** Slug-ul articolului (pentru construirea URL-ului) */
  slug: string;
  /** Excerpt / descriere scurtă (fără HTML) */
  excerpt: string;
  /** URL-ul imaginii de copertă */
  coverImage?: string;
  /** Numele categoriei */
  categoryName?: string;
  /** Numele autorului */
  authorName?: string;
  /**
   * URL-ul personalizat de dezabonare pentru destinatarul curent.
   * Construit cu `buildUnsubscribeUrl(email)` din lib/unsubscribe-token.ts.
   * Dacă lipsește, se folosește un fallback generic (link spre /contact)
   * — util pentru preview-uri / dry runs, nu pentru trimitere reală.
   */
  unsubscribeUrl?: string;
}

/**
 * Construiește HTML-ul complet al emailului pentru un articol de blog.
 * Folosește layout bazat pe tabele (cea mai bună compatibilitate cu clienții email).
 */
export function buildBlogNewsletterHtml(data: BlogNewsletterTemplateData): string {
  const articleUrl = `${SITE_URL}/blog/${data.slug}`;
  const unsubscribeUrl = data.unsubscribeUrl || `${SITE_URL}/contact`;
  const safeTitle = escapeHtml(data.title);
  const safeExcerpt = escapeHtml(data.excerpt);
  const safeCategoryName = data.categoryName ? escapeHtml(data.categoryName) : "";
  const safeAuthorName = data.authorName ? escapeHtml(data.authorName) : "";
  const metaLine =
    safeCategoryName && safeAuthorName
      ? `${safeCategoryName} &nbsp;&bull;&nbsp; ${safeAuthorName}`
      : safeCategoryName || safeAuthorName;

  const socialIconsHtml = SOCIAL_LINKS.map(
    (s) => `
        <td style="padding:0 3px;">
          <a href="${s.url}" target="_blank" style="text-decoration:none;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:${ICON_BG};border-radius:4px;">
              <tr>
                <td align="center" valign="middle" width="32" height="32" style="padding:4px;">
                  <img src="${SOCIAL_ICONS[s.icon]}" alt="${s.name}" width="24" height="24" style="display:block;border:0;width:24px;height:24px;" />
                </td>
              </tr>
            </table>
          </a>
        </td>`,
  ).join("");

  // Skip imaginea dacă e un data URI (data:image/...;base64,...).
  // Zenblog inline-uiește data URIs pentru imagini foarte mici (optimizare browser),
  // dar Gmail BLOCHEAZĂ data URIs din motive de securitate → imaginea apare ca
  // alt text-link albastru. Mai bine fără imagine decât link rupt.
  // Pentru articolele cu imagini reale (URL extern), va merge normal.
  const coverUrl =
    data.coverImage && !data.coverImage.startsWith("data:") && /^https?:\/\//i.test(data.coverImage)
      ? data.coverImage
      : null;
  const coverImageHtml = coverUrl
    ? `
              <tr>
                <td style="padding:0 0 16px 0;">
                  <a href="${articleUrl}" target="_blank" style="text-decoration:none;">
                    <img src="${escapeHtml(coverUrl)}" alt="${safeTitle}" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;" />
                  </a>
                </td>
              </tr>`
    : "";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="ro">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="format-detection" content="telephone=no" />
  <title>${safeTitle}</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
    body, table, td, p, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
    body { margin:0 !important; padding:0 !important; width:100% !important; background-color:${CREAM}; }
    a { color:${ORANGE}; }
    @media only screen and (max-width: 600px) {
      .container { width:100% !important; max-width:100% !important; }
      .px-32 { padding-left:20px !important; padding-right:20px !important; }
      .footer-col { display:block !important; width:100% !important; padding:0 0 16px 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${CREAM};font-family:'Playfair Display',Georgia,'Times New Roman',serif;color:${TEXT_DARK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${CREAM};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- LOGO -->
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <img src="${LOGO_URL}" alt="Hărți România" width="120" style="display:block;border:0;max-width:120px;height:auto;" />
            </td>
          </tr>
        </table>

        <!-- CARD ALB -->
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;">

          <!-- H1 portocaliu -->
          <tr>
            <td align="center" class="px-32" style="padding:32px 32px 8px 32px;">
              <h1 style="margin:0;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:32px;line-height:1.2;color:${ORANGE};font-weight:700;">Postare nouă pe blog</h1>
            </td>
          </tr>

          <!-- Articol: titlu + meta + cover + excerpt + CTA -->
          <tr>
            <td align="left" class="px-32" style="padding:24px 32px 8px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 0 8px 0;">
                    <a href="${articleUrl}" target="_blank" style="text-decoration:none;color:${TEXT_DARK};">
                      <h2 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:22px;line-height:1.3;color:${TEXT_DARK};font-weight:700;">${safeTitle}</h2>
                    </a>
                  </td>
                </tr>
                ${
                  metaLine
                    ? `
                <tr>
                  <td style="padding:0 0 16px 0;">
                    <p style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:14px;color:${TEXT_MUTED};">${metaLine}</p>
                  </td>
                </tr>`
                    : ""
                }
                ${coverImageHtml}
                <tr>
                  <td style="padding:0 0 16px 0;">
                    <p style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:16px;line-height:1.6;color:${TEXT_DARK};">${safeExcerpt}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 24px 0;">
                    <a href="${articleUrl}" target="_blank" style="font-family:'Playfair Display',Georgia,serif;font-size:16px;color:${ORANGE};text-decoration:underline;font-weight:600;">Citește articolul &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Mesaj de încheiere + semnătură -->
          <tr>
            <td align="left" class="px-32" style="padding:8px 32px 24px 32px;">
              <p style="margin:0 0 16px 0;font-family:'Playfair Display',Georgia,serif;font-size:16px;line-height:1.6;color:${TEXT_DARK};">
                Te invităm să citești noul articol și să te lași purtat de misterioasele povești ale trecutului.
              </p>
              <p style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:16px;line-height:1.6;color:${TEXT_DARK};">
                Cu drag,<br />
                Andrei Neguș<br />
                Fondator Hărți România
              </p>
            </td>
          </tr>

          <!-- Social block -->
          <tr>
            <td align="center" class="px-32" style="padding:24px 32px 32px 32px;">
              <p style="margin:0 0 16px 0;font-family:'Playfair Display',Georgia,serif;font-size:16px;font-weight:700;color:${TEXT_DARK};">
                Mai multe articole pe blog și pe rețelele sociale
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                <tr>${socialIconsHtml}</tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- FOOTER PORTOCALIU -->
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:${ORANGE};">
          <tr>
            <td style="padding:32px;color:#ffffff;font-family:'Playfair Display',Georgia,serif;font-size:14px;line-height:1.5;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="footer-col" valign="top" width="50%" style="padding-right:16px;color:#ffffff;">
                    <p style="margin:0 0 8px 0;font-weight:700;font-size:16px;color:#ffffff;">Harti Romania</p>
                    <p style="margin:0;">
                      <a href="${SITE_URL}" target="_blank" style="color:#ffffff;text-decoration:underline;">hartiromania.ro</a>
                    </p>
                  </td>
                  <td class="footer-col" valign="top" width="50%" style="padding-left:16px;color:#ffffff;">
                    <p style="margin:0 0 12px 0;color:#ffffff;">
                      Primești acest email pentru că te-ai abonat la newsletter-ul Hărți România. Te poți dezabona oricând, folosind linkul de mai jos.
                    </p>
                    <p style="margin:0;">
                      <a href="${unsubscribeUrl}" style="color:#ffffff;text-decoration:underline;">Dezabonează-te</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Construiește subiectul emailului pentru un articol de blog.
 * Format: "Postare nouă pe blogul Hărți România: [titlu]"
 */
export function buildBlogNewsletterSubject(title: string): string {
  return `Postare nouă pe blog: ${title}`;
}

/**
 * Construiește textul plain (fallback pentru clienții care nu randează HTML).
 */
export function buildBlogNewsletterPlainText(data: BlogNewsletterTemplateData): string {
  const articleUrl = `${SITE_URL}/blog/${data.slug}`;
  const unsubscribeUrl = data.unsubscribeUrl || `${SITE_URL}/contact`;
  const meta =
    data.categoryName && data.authorName
      ? `${data.categoryName} • ${data.authorName}`
      : data.categoryName || data.authorName || "";

  return `Postare nouă pe blog

${data.title}
${meta ? meta + "\n" : ""}
${data.excerpt}

Citește articolul: ${articleUrl}

Te invităm să citești noul articol și să te lași purtat de misterioasele povești ale trecutului.

Cu drag,
Andrei Neguș
Fondator Hărți România

—
Hărți România — ${SITE_URL}
Te poți dezabona oricând: ${unsubscribeUrl}
`;
}

/** Escapează caractere HTML speciale pentru a preveni breakuri în template. */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
