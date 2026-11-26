import Link from "next/link";

import { ConsentDetails } from "@/components/cookie-consent";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Politica de cookie-uri",
  description: "Ce cookie-uri folosește hartiromania.ro și cum îți schimbi alegerea oricând.",
  path: "/politica-cookies",
});

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Politica de cookie-uri" updated="26 noiembrie 2026">
      <h2>Alegerea ta</h2>
      <ConsentDetails />

      <h2>Ce sunt cookie-urile</h2>
      <p>
        Fișiere mici pe care site-ul le salvează în browserul tău. Unele sunt necesare ca site-ul să
        funcționeze, pe celelalte le folosim doar dacă ești de acord.
      </p>

      <h2>Ce cookie-uri folosim</h2>
      <ul>
        <li>
          <strong>Strict necesare:</strong> țin minte alegerile tale (de exemplu, cea despre
          cookie-uri, timp de 6 luni) și protejează formularul de contact împotriva spamului. Sunt
          mereu active.
        </li>
        <li>
          <strong>Statistici:</strong> doar cu acordul tău. Ne arată, în mod agregat, cum este
          folosit site-ul. Pentru asta folosim Google Analytics, ale cărui cookie-uri rămân cel mult
          2 ani.
        </li>
      </ul>

      <h2>Cum îți schimbi alegerea</h2>
      <p>
        Oricând, din „Setări cookie”, jos în orice pagină. Dacă retragi acordul, ștergem
        cookie-urile de statistici din browserul tău. Poți bloca cookie-urile și din setările
        browserului.
      </p>

      <p>
        Mai multe despre datele personale afli din{" "}
        <Link href="/politica-de-confidentialitate">Politica de confidențialitate</Link>.
      </p>
    </LegalPage>
  );
}
