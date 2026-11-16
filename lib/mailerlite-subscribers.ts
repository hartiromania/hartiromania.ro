/**
 * Client minimal pentru MailerLite Subscribers API.
 *
 * Folosit de cron handler-ul `/api/cron/blog-newsletter` pentru a obține
 * lista de abonați activi dintr-un grup (input pentru trimiterea via Resend).
 *
 * De asemenea expune o funcție de unsubscribe — folosită de endpoint-ul
 * `/api/newsletter/unsubscribe` când userul dă click pe linkul din email.
 *
 * Docs: https://developers.mailerlite.com/docs/subscribers.html
 */

const MAILERLITE_API_BASE = "https://connect.mailerlite.com/api";

export interface MailerLiteSubscriber {
  id: string;
  email: string;
  status: string;
  fields?: Record<string, unknown>;
}

interface ListSubscribersResponse {
  data: MailerLiteSubscriber[];
  meta?: {
    next_cursor?: string | null;
    prev_cursor?: string | null;
  };
}

/**
 * Returnează TOATE adresele active dintr-un grup (paginare automată).
 *
 * MailerLite returnează maxim 100 pe pagină. Pentru lista noastră curentă
 * (zeci de abonați), o singură pagină de obicei e suficientă. Codul gestionează
 * paginarea cursorială complet pentru viitor.
 *
 * Filtrăm explicit pe `status=active` ca să excludem unsubscribed/bounced/etc.
 */
export async function fetchActiveSubscribers(input: {
  apiKey: string;
  groupId: string;
  /** Limita de siguranță — la 50.000 de abonați ne oprim oricum (sanity). */
  maxSubscribers?: number;
}): Promise<MailerLiteSubscriber[]> {
  const { apiKey, groupId } = input;
  const maxSubscribers = input.maxSubscribers ?? 50000;

  const collected: MailerLiteSubscriber[] = [];
  let cursor: string | null = null;
  let safetyCounter = 0;

  while (true) {
    safetyCounter++;
    if (safetyCounter > 500) {
      // 500 pagini × 100 subscribers = 50K — sanity break în caz de loop
      console.error("[mailerlite-subscribers] Safety break: 500+ pages");
      break;
    }

    const params = new URLSearchParams();
    params.set("filter[status]", "active");
    params.set("limit", "100");
    if (cursor) params.set("cursor", cursor);

    const url = `${MAILERLITE_API_BASE}/groups/${encodeURIComponent(groupId)}/subscribers?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`MailerLite fetchActiveSubscribers failed: ${response.status} ${errorText}`);
    }

    const json = (await response.json()) as ListSubscribersResponse;
    const batch = json.data || [];
    collected.push(...batch);

    if (collected.length >= maxSubscribers) break;

    const next = json.meta?.next_cursor;
    if (!next) break;
    cursor = next;
  }

  return collected.filter((s) => s.status === "active");
}

/**
 * Scoate un abonat din grupul de newsletter (NU îl marchează global unsubscribed).
 *
 * Flow:
 *   1. GET /api/subscribers/{email} → găsim ID-ul intern MailerLite
 *   2. DELETE /api/subscribers/{id}/groups/{groupId} → scoatem din grup
 *
 * De ce NU folosim `status: "unsubscribed"` (vechea abordare):
 *   - Pe Free plan, MailerLite tratează unsubscribe via API ca "hard" unsubscribe
 *     și NU permite re-activare via API ulterior. Cineva care s-a dezabonat din
 *     greșeală nu se mai poate re-abona din formularul de pe site — formularul
 *     răspunde 200 dar MailerLite ignoră silent schimbarea de status.
 *   - Group removal e standard în industrie pentru newsletter unsubscribe și e
 *     reversibil: re-subscribe via POST /api/subscribers cu `groups: [...]` îl
 *     adaugă înapoi instant.
 *
 * Pentru cazul nostru (UN singur grup, un singur tip de comunicare),
 * "scos din grup" = efectiv "unsubscribed" pentru toate intențiile practice.
 *
 * Returnează `alreadyUnsubscribed: true` dacă:
 *   - subscriber-ul nu există deloc în MailerLite (404 la GET)
 *   - subscriber-ul există dar nu e în grup (404 la DELETE)
 */
export async function unsubscribeByEmail(input: {
  apiKey: string;
  email: string;
  groupId: string;
}): Promise<{ alreadyUnsubscribed: boolean }> {
  const { apiKey, email, groupId } = input;
  const normalizedEmail = email.toLowerCase().trim();

  // === 1. GET subscriber by email ===
  const getResponse = await fetch(
    `${MAILERLITE_API_BASE}/subscribers/${encodeURIComponent(normalizedEmail)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    },
  );

  if (getResponse.status === 404) {
    return { alreadyUnsubscribed: true };
  }

  if (!getResponse.ok) {
    const errorText = await getResponse.text().catch(() => "");
    throw new Error(`MailerLite getSubscriber failed: ${getResponse.status} ${errorText}`);
  }

  const data = (await getResponse.json()) as { data?: { id?: string | number } };
  const subscriberId = data?.data?.id;
  if (!subscriberId) {
    throw new Error(`MailerLite getSubscriber: missing ID in response`);
  }

  // === 2. DELETE subscriber from group ===
  const deleteResponse = await fetch(
    `${MAILERLITE_API_BASE}/subscribers/${subscriberId}/groups/${encodeURIComponent(groupId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    },
  );

  // 204 No Content = success (standard pentru DELETE)
  // 200 OK = success cu body (uneori MailerLite returnează asta)
  if (deleteResponse.status === 204 || deleteResponse.status === 200) {
    return { alreadyUnsubscribed: false };
  }

  // 404 = subscriber-ul nu era în grup → tratăm ca "deja dezabonat"
  if (deleteResponse.status === 404) {
    return { alreadyUnsubscribed: true };
  }

  const errorText = await deleteResponse.text().catch(() => "");
  throw new Error(`MailerLite removeFromGroup failed: ${deleteResponse.status} ${errorText}`);
}
