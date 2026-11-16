import { type NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { zenblogApi, type ZenblogPost } from "@/lib/zenblog";
import {
  buildBlogNewsletterHtml,
  buildBlogNewsletterPlainText,
  buildBlogNewsletterSubject,
} from "@/lib/blog-newsletter-template";
import { fetchActiveSubscribers } from "@/lib/mailerlite-subscribers";
import { buildUnsubscribeUrl } from "@/lib/unsubscribe-token";

/**
 * Cron handler — verifică dacă există un articol nou pe blog și, dacă da,
 * trimite un email de newsletter către abonații activi din grupul MailerLite.
 *
 * Arhitectură:
 *   1. MailerLite rămâne baza de date pentru abonați (formularele de pe site
 *      continuă să POST-eze acolo). Aici doar CITIM lista activă.
 *   2. Trimiterea efectivă se face prin **Resend** (per-destinatar, cu link
 *      de dezabonare unic semnat HMAC). Asta evită limita MailerLite Free
 *      care blochează "Content submission via API" — disponibilă doar pe Advanced.
 *
 * Rulează zilnic (configurat în vercel.json). Vercel adaugă automat header-ul
 * `Authorization: Bearer ${CRON_SECRET}` la apelurile programate.
 *
 * Query params (pentru testare manuală):
 *   ?force=true     → bypass verificarea KV (trimite chiar dacă nu e articol nou)
 *   ?dry=true       → execută tot logic-ul DAR nu trimite emailuri
 *   ?bootstrap=true → permite trimiterea la primul run (când KV-ul e gol)
 *   ?preview=true   → returnează HTML-ul direct în browser (cu link dummy)
 *   ?secret=...     → fallback la Authorization header (pentru Preview deploys)
 *
 * Cheia din KV:
 *   `blog-newsletter:last-sent-slug` — slug-ul ultimului articol pentru care
 *   s-a trimis email. Se actualizează DOAR după ce CEL PUȚIN UN email a plecat
 *   cu succes (așa retry-urile la eșec total funcționează corect).
 */

const KV_KEY = "blog-newsletter:last-sent-slug";

const FROM_NAME = "Echipa Hărți România";
const FROM_EMAIL = "newsletter@hartiromania.ro";
const REPLY_TO = "contact@hartiromania.ro";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // secunde

export async function GET(request: NextRequest) {
  // === Auth ===
  // Accept două forme de autentificare:
  //   1. Header `Authorization: Bearer ${CRON_SECRET}` — folosit de Vercel Cron pe Production
  //   2. Query param `?secret=${CRON_SECRET}` — fallback pentru testare manuală pe Preview
  //      (Vercel Deployment Protection poate intercepta Authorization header, dar nu și query params)
  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET nu e configurat în env vars." },
      { status: 500 },
    );
  }
  const headerOk = authHeader === `Bearer ${cronSecret}`;
  const queryOk = querySecret === cronSecret;
  if (!headerOk && !queryOk) {
    const fingerprint = (s: string | null | undefined) =>
      s ? `${s.slice(0, 4)}...${s.slice(-4)} (len=${s.length})` : "null";
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized",
        debug: {
          message: "Nici headerul Authorization, nici query param ?secret nu au valoarea corectă.",
          received_authorization_header: authHeader
            ? fingerprint(authHeader.replace(/^Bearer\s+/, ""))
            : "missing",
          received_query_secret: querySecret ? fingerprint(querySecret) : "missing",
          expected_secret_fingerprint: fingerprint(cronSecret),
        },
      },
      { status: 401 },
    );
  }

  // === Config env ===
  const apiKey = process.env.MAILERLITE_API_KEY;
  const groupId = process.env.MAILERLITE_GROUP_ID;
  const resendApiKey = process.env.RESEND_API_KEY;
  const tokenSecret = process.env.UNSUBSCRIBE_TOKEN_SECRET;

  const missingVars: string[] = [];
  if (!apiKey) missingVars.push("MAILERLITE_API_KEY");
  if (!groupId) missingVars.push("MAILERLITE_GROUP_ID");
  if (!resendApiKey) missingVars.push("RESEND_API_KEY");
  if (!tokenSecret) missingVars.push("UNSUBSCRIBE_TOKEN_SECRET");
  if (missingVars.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Lipsesc env vars: ${missingVars.join(", ")}.` },
      { status: 500 },
    );
  }

  // === Query flags ===
  const url = request.nextUrl;
  const force = url.searchParams.get("force") === "true";
  const dryRun = url.searchParams.get("dry") === "true";
  const bootstrap = url.searchParams.get("bootstrap") === "true";
  const preview = url.searchParams.get("preview") === "true";

  const log: Record<string, unknown> = {
    startedAt: new Date().toISOString(),
    force,
    dryRun,
    bootstrap,
  };

  try {
    // === 1. Fetch ultimul articol din Zenblog ===
    const { data: posts } = await zenblogApi.posts.list({ limit: 1 });
    if (!posts || posts.length === 0) {
      return NextResponse.json({ ok: true, action: "skip", reason: "no-posts-on-blog", log });
    }
    const latest = posts[0];
    log.latestSlug = latest.slug;
    log.latestTitle = latest.title;
    // Debug: ce format are cover_image din API-ul Zenblog?
    // (Util pentru diagnoză când imaginea nu apare în Gmail.)
    if (latest.cover_image) {
      log.coverImagePreview = latest.cover_image.slice(0, 80);
      log.coverImageLength = latest.cover_image.length;
      log.coverImageType = latest.cover_image.startsWith("data:")
        ? "data-uri"
        : /^https?:\/\//i.test(latest.cover_image)
          ? "url"
          : "unknown";
    } else {
      log.coverImageType = "missing";
    }

    // === 2. Read last_sent_slug din KV ===
    const redis = Redis.fromEnv();
    const lastSentSlug = await redis.get<string>(KV_KEY);
    log.lastSentSlug = lastSentSlug;

    // === 3. Decide dacă trimitem ===
    // Atât ?force=true cât și ?preview=true sar peste verificarea KV.
    if (!force && !preview) {
      // First run: KV gol → doar inițializăm (nu trimitem), decât dacă bootstrap=true
      if (lastSentSlug === null || lastSentSlug === undefined) {
        if (!bootstrap) {
          if (dryRun) {
            return NextResponse.json({
              ok: true,
              action: "would-initialize",
              reason: "dry-run-first-run",
              message: `Dry run: KV e gol. La rularea reală fără ?dry, codul ar salva slug-ul "${latest.slug}" în KV și NU ar trimite email (init mode). Pentru a forța trimiterea acum, folosește ?bootstrap=true (fără ?dry).`,
              log,
            });
          }
          await redis.set(KV_KEY, latest.slug);
          return NextResponse.json({
            ok: true,
            action: "initialized",
            reason: "first-run-no-send",
            message: `KV inițializat cu slug-ul "${latest.slug}". La următorul articol nou va trimite email. Folosește ?bootstrap=true ca să forțezi trimiterea la primul run.`,
            log,
          });
        }
      } else if (lastSentSlug === latest.slug) {
        return NextResponse.json({
          ok: true,
          action: "skip",
          reason: "no-new-post",
          message: `Cel mai nou articol ("${latest.slug}") a fost deja trimis. Skip.`,
          log,
        });
      }
    }

    // === 4. Construiește datele template-ului ===
    const excerpt = deriveExcerpt(latest);
    const baseTemplateData = {
      title: latest.title,
      slug: latest.slug,
      excerpt,
      coverImage: latest.cover_image,
      categoryName: latest.category?.name,
      authorName: latest.authors?.[0]?.name,
    };
    const subject = buildBlogNewsletterSubject(latest.title);

    log.subject = subject;

    // === 4.5. Preview mode? returnează HTML-ul direct în browser ===
    // Folosim un link de dezabonare "dummy" — preview-ul nu e per-destinatar.
    if (preview) {
      const html = buildBlogNewsletterHtml({
        ...baseTemplateData,
        unsubscribeUrl: "https://www.hartiromania.ro/contact",
      });
      return new Response(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // === 5. Fetch lista de abonați activi din MailerLite ===
    const subscribers = await fetchActiveSubscribers({
      apiKey: apiKey!,
      groupId: groupId!,
    });
    log.subscriberCount = subscribers.length;

    if (subscribers.length === 0) {
      return NextResponse.json({
        ok: true,
        action: "skip",
        reason: "no-active-subscribers",
        message: "Nu sunt abonați activi în grup. Skip.",
        log,
      });
    }

    // === 6. Dry run? exit aici cu detalii ===
    if (dryRun) {
      const sampleHtml = buildBlogNewsletterHtml({
        ...baseTemplateData,
        unsubscribeUrl: buildUnsubscribeUrl(subscribers[0].email),
      });
      return NextResponse.json({
        ok: true,
        action: "dry-run",
        message: `Dry run — am construit ${subscribers.length} email-uri DAR nu le-am trimis. KV nu a fost actualizat.`,
        preview: {
          subject,
          subscriberCount: subscribers.length,
          sampleHtmlLength: sampleHtml.length,
          firstSubscriberEmail: maskEmail(subscribers[0].email),
        },
        log,
      });
    }

    // === 7. Trimite cu Resend, per-destinatar ===
    const resend = new Resend(resendApiKey);
    const fromHeader = `${FROM_NAME} <${FROM_EMAIL}>`;

    let sentCount = 0;
    let failedCount = 0;
    const failures: Array<{ email: string; error: string }> = [];

    for (const sub of subscribers) {
      const unsubscribeUrl = buildUnsubscribeUrl(sub.email);
      const html = buildBlogNewsletterHtml({ ...baseTemplateData, unsubscribeUrl });
      const text = buildBlogNewsletterPlainText({ ...baseTemplateData, unsubscribeUrl });

      try {
        const result = await resend.emails.send({
          from: fromHeader,
          to: [sub.email],
          replyTo: REPLY_TO,
          subject,
          html,
          text,
          headers: {
            // RFC 8058 — Gmail/Outlook afișează "Unsubscribe" în header-ul emailului,
            // iar la click face POST aici pentru one-click unsubscribe.
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });

        if (result.error) {
          failedCount++;
          failures.push({ email: maskEmail(sub.email), error: result.error.message });
        } else {
          sentCount++;
        }
      } catch (sendError) {
        failedCount++;
        failures.push({
          email: maskEmail(sub.email),
          error: sendError instanceof Error ? sendError.message : String(sendError),
        });
      }
    }

    log.sentCount = sentCount;
    log.failedCount = failedCount;
    if (failures.length > 0) log.failures = failures.slice(0, 10); // primele 10 pentru debugging

    // === 8. Update KV cu noul slug (DOAR dacă s-a trimis cel puțin un email) ===
    // Dacă TOATE au eșuat (rar, dar posibil — auth Resend invalid etc.) lăsăm KV
    // neatins ca să poată retrya următoarea rulare.
    if (sentCount > 0) {
      await redis.set(KV_KEY, latest.slug);
      log.kvUpdated = true;
    } else {
      log.kvUpdated = false;
    }

    const action = sentCount > 0 ? "sent" : "error";
    const status = sentCount > 0 ? 200 : 500;

    return NextResponse.json(
      {
        ok: sentCount > 0,
        action,
        message:
          sentCount > 0
            ? `Trimis ${sentCount}/${subscribers.length} email-uri pentru articolul "${latest.title}". ${failedCount} eșec(uri).`
            : `Toate cele ${subscribers.length} trimiteri au eșuat. KV nu a fost actualizat — va încerca din nou la următoarea rulare.`,
        log,
      },
      { status },
    );
  } catch (error) {
    console.error("[cron/blog-newsletter] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        action: "error",
        error: error instanceof Error ? error.message : String(error),
        log,
      },
      { status: 500 },
    );
  }
}

/**
 * Derivă un excerpt de afișat în email din articol.
 * Folosește excerpt-ul explicit dacă există, altfel primele ~200 caractere
 * din html_content (stripped de tag-uri).
 */
function deriveExcerpt(post: ZenblogPost): string {
  if (post.excerpt && post.excerpt.trim().length > 0) {
    return post.excerpt.trim();
  }
  const plain = (post.html_content || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= 220) return plain;
  return plain.slice(0, 220).replace(/\s+\S*$/, "") + "…";
}

/**
 * Mască un email pentru log-uri (ion***@exemplu.ro).
 * Reduce riscul de scurgere de PII în log-urile Vercel.
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const visible = local.slice(0, Math.min(3, local.length));
  return `${visible}${local.length > 3 ? "***" : ""}@${domain}`;
}
