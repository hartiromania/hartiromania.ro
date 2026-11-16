import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Textul trimis de vizitator ajunge în HTML-ul emailului; caracterele HTML sunt
// neutralizate, ca nimeni să nu poată strecura linkuri sau formatări în mesaj.
function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  try {
    // Clientul se creează la cerere, nu la încărcarea modulului: build-ul (local și
    // în CI) rulează fără RESEND_API_KEY, iar constructorul Resend aruncă fără cheie.
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY lipsește");
      return NextResponse.json({ error: "Eroare internă de server" }, { status: 500 });
    }
    const resend = new Resend(apiKey);

    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Toate câmpurile sunt obligatorii" }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: "Formular Contact Hărți România <sent@hartiromania.ro>",
      to: ["contact@hartiromania.ro"],
      replyTo: email, // This allows replies to go directly to the person who submitted the form
      subject: `Mesaj nou de pe site-ul Hărți România: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 10px;">
            Mesaj nou de pe site-ul Hărți România
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nume:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Subiect:</strong> ${escapeHtml(subject)}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #374151;">Mesaj:</h3>
            <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #0f766e; border-radius: 4px;">
              ${escapeHtml(message).replace(/\n/g, "<br>")}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p>Acest email a fost trimis prin formularul de contact de pe hartiromania.ro</p>
            <p><strong>Răspundeți direct la acest email</strong> pentru a contacta persoana care a trimis mesajul.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Eroare la trimiterea emailului" }, { status: 500 });
    }

    return NextResponse.json({ message: "Mesajul a fost trimis cu succes!" }, { status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Eroare internă de server" }, { status: 500 });
  }
}
