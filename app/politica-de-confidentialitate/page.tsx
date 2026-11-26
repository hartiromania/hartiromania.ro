import Link from "next/link";

import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Politica de confidențialitate",
  description:
    "Ce date personale prelucrează hartiromania.ro, de ce și ce drepturi ai conform GDPR.",
  path: "/politica-de-confidentialitate",
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Politica de confidențialitate" updated="26 noiembrie 2026">
      <p>
        Pe scurt, ce date personale prelucrăm pe hartiromania.ro, de ce și ce drepturi ai, conform
        Regulamentului (UE) 2016/679 (GDPR).
      </p>

      <h2>Cine răspunde de date</h2>
      <p>
        Site-ul este operat de Hărți România. Pentru orice întrebare despre datele tale ne poți
        scrie la <a href="mailto:contact@hartiromania.ro">contact@hartiromania.ro</a>.
      </p>

      <h2>Ce date prelucrăm și cât timp</h2>
      <ul>
        <li>
          <strong>Mesajele prin formularul de contact:</strong> numele, emailul, mesajul și date
          tehnice de bază, ca să îți răspundem și să oprim spamul. Cel mult 3 ani.
        </li>
        <li>
          <strong>Newsletter:</strong> emailul și, dacă îl scrii, numele. Până te dezabonezi.
        </li>
        <li>
          <strong>Cookie-uri de analiză:</strong> date despre cum este folosit site-ul, doar cu
          acordul tău. Cel mult 14 luni. Detalii în{" "}
          <Link href="/politica-cookies">Politica de cookie-uri</Link>.
        </li>
        <li>
          <strong>Dovada alegerii despre cookie-uri:</strong> alegerea, data și adresa IP fără
          ultima parte. 3 ani.
        </li>
        <li>
          <strong>Date de vizitare:</strong> adresa IP și tipul de browser, folosite pentru
          funcționarea și securitatea site-ului. Cel mult 30 de zile.
        </li>
      </ul>
      <p>
        Le prelucrăm pe baza acordului tău (newsletter, analiză), a cererii tale (mesaje), a
        interesului nostru legitim de a proteja site-ul și a obligației legale de a putea dovedi
        acordul.
      </p>
      <p>
        Comenzile se plasează pe eMAG, care prelucrează datele de comandă, plată și livrare conform
        propriei politici.
      </p>

      <h2>Cui transmitem datele</h2>
      <p>
        Nu vindem datele nimănui. Ajung doar la furnizorii care ne ajută să funcționăm (găzduire,
        email, newsletter, protecție anti-spam și statistici), pe bază de contract. Unii pot
        prelucra date în afara Uniunii Europene, numai cu garanțiile cerute de GDPR.
      </p>

      <h2>Drepturile tale</h2>
      <p>
        Poți cere oricând accesul la date, corectarea, ștergerea sau portabilitatea lor,
        restricționarea prelucrării ori te poți opune prelucrării. Îți poți retrage acordul oricând,
        fără să afecteze ce s-a făcut până atunci. Scrie-ne la{" "}
        <a href="mailto:contact@hartiromania.ro">contact@hartiromania.ro</a> și îți răspundem în cel
        mult o lună. Poți depune și plângere la Autoritatea Națională de Supraveghere a Prelucrării
        Datelor cu Caracter Personal (
        <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">
          dataprotection.ro
        </a>
        ).
      </p>

      <h2>Modificări</h2>
      <p>Când actualizăm această politică, schimbăm data de mai sus.</p>
    </LegalPage>
  );
}
