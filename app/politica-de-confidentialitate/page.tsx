import Link from "next/link";

import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Politica de confidențialitate",
  description:
    "Ce date personale prelucrează hartiromania.ro, de ce, cât timp le păstrăm, cui le transmitem și ce drepturi ai conform GDPR.",
  path: "/politica-de-confidentialitate",
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Politica de confidențialitate" updated="26 noiembrie 2026">
      <p>
        Pe scurt: colectăm doar datele de care avem nevoie, nu le vindem nimănui și le folosim numai
        pentru scopurile de mai jos. Mai jos găsești totul în detaliu, conform Regulamentului (UE)
        2016/679 (GDPR).
      </p>

      <h2>Cine suntem</h2>
      <p>
        Operatorul datelor este Hărți România (hartiromania.ro), cu sediul în Râșnov, județul
        Brașov. Ne poți scrie oricând la{" "}
        <a href="mailto:contact@hartiromania.ro">contact@hartiromania.ro</a> sau ne poți suna la +40
        756 705 633.
      </p>

      <h2>Ce date prelucrăm și de ce</h2>

      <h3>Când ne scrii prin formularul de contact</h3>
      <ul>
        <li>
          <strong>Date:</strong> numele, adresa de email, subiectul și mesajul tău. Pentru protecția
          împotriva mesajelor automate (spam) înregistrăm și adresa IP, orașul și țara aproximative
          și tipul de dispozitiv și browser.
        </li>
        <li>
          <strong>De ce:</strong> ca să îți răspundem și să ținem formularul curat de spam.
        </li>
        <li>
          <strong>Temei:</strong> demersurile pe care le faci înainte de o eventuală comandă (art. 6
          alin. (1) lit. b) și interesul nostru legitim de a ne proteja de abuzuri (lit. f).
        </li>
        <li>
          <strong>Cât timp:</strong> cât e nevoie pentru discuția cu tine și cel mult 3 ani după
          ultimul mesaj.
        </li>
      </ul>

      <h3>Când te abonezi la newsletter</h3>
      <ul>
        <li>
          <strong>Date:</strong> adresa de email, numele (dacă îl scrii), data abonării și locul de
          pe site de unde te-ai abonat.
        </li>
        <li>
          <strong>De ce:</strong> ca să îți trimitem noutăți despre produse și articole noi de pe
          blog.
        </li>
        <li>
          <strong>Temei:</strong> consimțământul tău (art. 6 alin. (1) lit. a), pe care îl poți
          retrage oricând din linkul „Dezabonează-te” din orice email.
        </li>
        <li>
          <strong>Cât timp:</strong> până te dezabonezi.
        </li>
      </ul>

      <h3>Statistici de vizitare (doar cu acordul tău)</h3>
      <ul>
        <li>
          <strong>Date:</strong> paginile vizitate, durata vizitei, sursa (de exemplu Google sau
          Facebook), țara și orașul aproximative, tipul de dispozitiv și browser, căutările din
          catalog și apăsările pe butoanele „Comandă”. Nu aflăm cine ești.
        </li>
        <li>
          <strong>De ce:</strong> ca să înțelegem ce vă interesează și să facem site-ul mai bun.
        </li>
        <li>
          <strong>Temei:</strong> consimțământul tău (art. 6 alin. (1) lit. a), dat din bannerul de
          cookie-uri. Detalii în <Link href="/politica-cookies">Politica de cookie-uri</Link>.
        </li>
        <li>
          <strong>Cât timp:</strong> cel mult 14 luni.
        </li>
      </ul>

      <h3>Dovada alegerii tale despre cookie-uri</h3>
      <ul>
        <li>
          <strong>Date:</strong> un cod aleatoriu (ID-ul consimțământului), alegerea făcută, data,
          pagina, adresa IP fără ultima parte (deci fără să te poată identifica), orașul și țara
          aproximative și tipul de dispozitiv.
        </li>
        <li>
          <strong>De ce:</strong> legea ne cere să putem dovedi că ai fost de acord (art. 7 alin.
          (1) GDPR).
        </li>
        <li>
          <strong>Temei:</strong> obligația legală (art. 6 alin. (1) lit. c).
        </li>
        <li>
          <strong>Cât timp:</strong> 3 ani de la ultima alegere.
        </li>
      </ul>

      <h3>Funcționarea și securitatea site-ului</h3>
      <p>
        Ca orice site, serverele noastre primesc adresa IP și datele tehnice ale browserului la
        fiecare vizită. Le folosim doar ca să livrăm paginile și să oprim atacurile, în baza
        interesului legitim (art. 6 alin. (1) lit. f), și se șterg automat după cel mult 30 de zile.
        Numărul total de vizite îl vedem și cu Vercel Web Analytics, care nu folosește cookie-uri și
        nu păstrează date despre tine.
      </p>

      <h3>Comenzile</h3>
      <p>
        Nu vindem direct pe site. Butonul „Comandă” te duce pe eMAG, iar datele pentru comandă,
        plată și livrare le dai acolo. Pentru ele, operator este eMAG, conform politicii proprii de
        confidențialitate.
      </p>

      <h2>Cui transmitem datele</h2>
      <p>
        Nu vindem și nu închiriem datele nimănui. Lucrăm cu furnizori care le prelucrează doar la
        cererea noastră, pe baza unui contract de prelucrare:
      </p>
      <ul>
        <li>Vercel, pentru găzduirea site-ului;</li>
        <li>Neon, pentru baza de date (servere în Frankfurt, Germania);</li>
        <li>Upstash, pentru protecția împotriva abuzurilor (servere în Frankfurt, Germania);</li>
        <li>Zoho Mail, pentru căsuța de email (servere în Uniunea Europeană);</li>
        <li>Resend, pentru trimiterea emailurilor;</li>
        <li>MailerLite, pentru lista de abonați la newsletter;</li>
        <li>
          Cloudflare, pentru verificarea anti-spam de pe pagina de contact (
          <a
            href="https://www.cloudflare.com/turnstile-privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            politica Cloudflare Turnstile
          </a>
          );
        </li>
        <li>
          Google, pentru Google Analytics, doar cu acordul tău (
          <a
            href="https://policies.google.com/privacy?hl=ro"
            target="_blank"
            rel="noopener noreferrer"
          >
            politica Google
          </a>
          ).
        </li>
      </ul>
      <p>
        Unii dintre acești furnizori pot prelucra date și în afara Uniunii Europene, mai ales în
        SUA. În aceste cazuri, transferul se face doar către companii certificate în cadrul EU-US
        Data Privacy Framework sau pe baza clauzelor contractuale standard aprobate de Comisia
        Europeană.
      </p>

      <h2>Drepturile tale</h2>
      <p>Conform GDPR, ai dreptul:</p>
      <ul>
        <li>să afli ce date avem despre tine și să primești o copie;</li>
        <li>să ceri corectarea datelor greșite;</li>
        <li>să ceri ștergerea datelor;</li>
        <li>să ceri restricționarea prelucrării;</li>
        <li>să primești datele într-un format pe care îl poți folosi în altă parte;</li>
        <li>să te opui prelucrării bazate pe interesul nostru legitim;</li>
        <li>să îți retragi oricând consimțământul, fără să afecteze ce s-a făcut până atunci.</li>
      </ul>
      <p>
        Scrie-ne la <a href="mailto:contact@hartiromania.ro">contact@hartiromania.ro</a> și îți
        răspundem în cel mult o lună. Dacă vrei să știi ce am înregistrat despre alegerea ta la
        cookie-uri, trimite-ne și ID-ul consimțământului din{" "}
        <Link href="/politica-cookies">Politica de cookie-uri</Link>.
      </p>
      <p>
        Dacă ai impresia că nu ți-am respectat drepturile, poți depune o plângere la Autoritatea
        Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (
        <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">
          dataprotection.ro
        </a>
        ).
      </p>

      <h2>Cum protejăm datele</h2>
      <p>
        Toată comunicarea cu site-ul este criptată (HTTPS). Accesul la datele salvate îl are doar
        administratorul site-ului, printr-o conectare cu cod unic trimis pe email, iar fiecare
        accesare este înregistrată. Păstrăm doar ce ne trebuie și ștergem restul.
      </p>

      <h2>Copiii</h2>
      <p>
        Site-ul nu se adresează copiilor sub 16 ani și nu colectăm intenționat date despre ei. Dacă
        afli că un copil ne-a trimis date, scrie-ne și le ștergem.
      </p>

      <h2>Modificări</h2>
      <p>
        Când schimbăm această politică, actualizăm data de mai sus. Dacă schimbarea privește
        cookie-urile, te întrebăm din nou ce alegi.
      </p>
    </LegalPage>
  );
}
