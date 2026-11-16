/**
 * Client minimal pentru MailerLite Campaigns API.
 *
 * Folosit de cron handler-ul `/api/cron/blog-newsletter` pentru a crea
 * și a trimite imediat o campanie când apare un articol nou pe blog.
 *
 * Docs: https://developers.mailerlite.com/docs/campaigns.html
 */

const MAILERLITE_API_BASE = "https://connect.mailerlite.com/api";

interface CreateCampaignInput {
  apiKey: string;
  groupId: string;
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  html: string;
  plainText: string;
}

interface CreateCampaignResult {
  campaignId: string;
  emailId: string;
}

/**
 * Creează o campanie de tip "regular" (draft) în MailerLite.
 * Returnează ID-ul campaniei pentru a putea fi programată ulterior.
 *
 * Payload-ul replică minim ce-a mers la Pas 0 (test API access) plus
 * language_id explicit. Câmpurile reply_to și plain_text sunt scoase
 * pentru că trigger-uiau validare diferită care cerea emails.0 ca array.
 * MailerLite auto-defaults:
 *   - reply_to → from
 *   - plain_text → generat din content HTML
 */
export async function createCampaign(input: CreateCampaignInput): Promise<CreateCampaignResult> {
  const payload = {
    name: input.name,
    type: "regular",
    language_id: 4, // English = 4 (default account language, setat la Pas 0)
    emails: [
      {
        subject: input.subject,
        from_name: input.fromName,
        from: input.fromEmail,
        content: input.html,
      },
    ],
    groups: [input.groupId],
  };

  const response = await fetch(`${MAILERLITE_API_BASE}/campaigns`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`MailerLite createCampaign failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const campaignId = data?.data?.id;
  const emailId = data?.data?.emails?.[0]?.id;

  if (!campaignId || !emailId) {
    throw new Error(
      `MailerLite createCampaign: răspuns neașteptat (missing id) - ${JSON.stringify(data)}`,
    );
  }

  return { campaignId: String(campaignId), emailId: String(emailId) };
}

interface ScheduleCampaignInput {
  apiKey: string;
  campaignId: string;
}

/**
 * Programează o campanie creată anterior pentru trimitere INSTANT.
 * MailerLite va începe să o trimită în următoarele câteva minute.
 */
export async function scheduleCampaignInstant(input: ScheduleCampaignInput): Promise<void> {
  const payload = {
    delivery: "instant",
  };

  const response = await fetch(`${MAILERLITE_API_BASE}/campaigns/${input.campaignId}/schedule`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`MailerLite scheduleCampaign failed: ${response.status} ${errorText}`);
  }
}

interface DeleteCampaignInput {
  apiKey: string;
  campaignId: string;
}

/**
 * Șterge o campanie (folosit pentru cleanup când scheduling-ul eșuează
 * după ce campania a fost deja creată, ca să nu rămână draft-uri orfane).
 */
export async function deleteCampaign(input: DeleteCampaignInput): Promise<void> {
  const response = await fetch(`${MAILERLITE_API_BASE}/campaigns/${input.campaignId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`MailerLite deleteCampaign failed: ${response.status} ${errorText}`);
  }
}
