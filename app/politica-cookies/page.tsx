import Link from "next/link";

import { ConsentDetails } from "@/components/cookie-consent";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Politica de cookie-uri",
  description:
    "Ce cookie-uri folosește hartiromania.ro, de ce, cât timp rămân și cum îți schimbi alegerea oricând.",
  path: "/politica-cookies",
});

type Row = { name: string; provider: string; purpose: string; duration: string };

const NECESSARY: Row[] = [
  {
    name: "hr_consent",
    provider: "hartiromania.ro",
    purpose: "Ține minte alegerea ta despre cookie-uri, ca să nu te întrebăm la fiecare pagină.",
    duration: "6 luni",
  },
  {
    name: "hr-newsletter-popup-state (stocare locală)",
    provider: "hartiromania.ro",
    purpose: "Ține minte dacă ai închis fereastra de newsletter sau te-ai abonat deja.",
    duration: "până o ștergi din browser",
  },
  {
    name: "Cloudflare Turnstile",
    provider: "Cloudflare",
    purpose:
      "Doar pe pagina de contact: verifică, fără să te deranjeze, că mesajul vine de la un om, nu de la un program automat.",
    duration: "durata vizitei",
  },
];

const STATISTICS: Row[] = [
  {
    name: "_ga",
    provider: "Google Analytics",
    purpose: "Deosebește vizitatorii între ei, fără să afle cine sunt, ca să numărăm vizitele.",
    duration: "2 ani",
  },
  {
    name: "_ga_<ID>",
    provider: "Google Analytics",
    purpose: "Păstrează starea vizitei curente (pagini văzute, durata).",
    duration: "2 ani",
  },
];

function CookieTable({ rows }: { rows: Row[] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-left text-base">
        <thead>
          <tr className="border-border border-b">
            <th scope="col" className="py-2 pr-4 font-semibold">
              Nume
            </th>
            <th scope="col" className="py-2 pr-4 font-semibold">
              Furnizor
            </th>
            <th scope="col" className="py-2 pr-4 font-semibold">
              Scop
            </th>
            <th scope="col" className="py-2 font-semibold">
              Durată
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-border border-b align-top">
              <td className="py-2 pr-4 font-mono text-sm break-all">{row.name}</td>
              <td className="py-2 pr-4">{row.provider}</td>
              <td className="py-2 pr-4">{row.purpose}</td>
              <td className="py-2 whitespace-nowrap">{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Politica de cookie-uri" updated="26 noiembrie 2026">
      <h2>Alegerea ta</h2>
      <ConsentDetails />
      <p>
        Dacă ne scrii pentru a afla ce date avem despre alegerea ta, trimite-ne și ID-ul de mai sus:
        așa găsim exact înregistrarea ta.
      </p>

      <h2>Ce sunt cookie-urile</h2>
      <p>
        Cookie-urile sunt fișiere mici pe care un site le salvează în browserul tău. Unele sunt
        necesare ca site-ul să funcționeze. Altele, cum sunt cele de statistică, le folosim doar
        dacă ești de acord.
      </p>

      <h2>Cookie-uri necesare</h2>
      <p>
        Sunt mereu active și nu cer acordul tău, pentru că fără ele site-ul nu poate funcționa
        corect. Nu le folosim ca să te urmărim.
      </p>
      <CookieTable rows={NECESSARY} />

      <h2>Cookie-uri de statistică</h2>
      <p>
        Le folosim doar după ce apeși „Accept” sau bifezi „Statistică” în „Setări cookie”. Până
        atunci, Google Analytics nici nu se încarcă pe site. Datele ne arată câți vizitatori avem,
        de unde vin, ce pagini și ce hărți îi interesează și pe ce butoane apasă (de exemplu
        „Comandă”). Google Analytics nu păstrează adresa IP, iar datele rămân în rapoarte cel mult
        14 luni.
      </p>
      <CookieTable rows={STATISTICS} />
      <p>
        Măsurăm și numărul de vizite cu Vercel Web Analytics, care nu folosește cookie-uri și nu
        păstrează date despre tine, doar totaluri.
      </p>

      <h2>Cum îți schimbi alegerea</h2>
      <p>
        Oricând, din butonul „Setări cookie” de mai sus sau din josul oricărei pagini. Dacă retragi
        acordul, ștergem imediat cookie-urile Google Analytics din browserul tău. Te întrebăm din
        nou după 6 luni sau când schimbăm ceva important în această politică.
      </p>
      <p>
        Poți șterge sau bloca cookie-urile și din setările browserului. Dacă blochezi și
        cookie-urile necesare, unele părți ale site-ului pot să nu mai funcționeze corect.
      </p>

      <h2>Mai multe detalii</h2>
      <p>
        Cum folosim datele personale, cui le transmitem și ce drepturi ai afli din{" "}
        <Link href="/politica-de-confidentialitate">Politica de confidențialitate</Link>. Pentru
        întrebări, scrie-ne la <a href="mailto:contact@hartiromania.ro">contact@hartiromania.ro</a>.
      </p>
    </LegalPage>
  );
}
