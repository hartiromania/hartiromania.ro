import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Povestea noastră",
  description:
    "Hărți România pornește din Râșnov, din pasiunea pentru hărți și pentru istoria nefalsificată a poporului român. Află cum restaurăm fiecare hartă.",
  path: "/despre",
});

export default function DesprePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16">
        <Image
          src="/assets/Cetatea_Rasnov_vazuta_din_soseaua_Cristian-Rasnov.jpg"
          alt="Drapelul României fluturând în vânt pe fundalul munților - fotografie vintage"
          fill
          sizes="100vw"
          className="object-cover object-[center_100%]"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-lg md:text-5xl">
            Povestea noastră
          </h1>
          <p className="mx-auto max-w-2xl text-2xl leading-relaxed font-semibold text-pretty text-white drop-shadow-lg md:text-3xl">
            {
              "Profesional, alege să faci ceea ce îți place . Dacă îți place, o vei face bine și cu pasiune. Când faci lucrurile bine, vine până la urmă și succesul!"
            }
          </p>
        </div>
      </section>

      {/* Story Introduction */}
      <section className="bg-background px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-6 text-justify text-xl leading-relaxed">
              Povestea noastră este aceea a unei familii mari și unite. Iubim România, țara unde
              ne-am născut și în inima căreia locuim într-un ținut încărcat de legende și istorii.
              Eu sunt Andrei, omul cu povești, fondatorul proiectului hartiromania.ro (fostul
              concept iubescromaniaharti.ro). „După lupte seculare” am reușit până la urmă să fac,
              din pură pasiune, exact ceea ce îmi place, în cel mai frumos loc din România, la
              Râșnov!
            </p>
            <p className="text-muted-foreground text-justify text-xl leading-relaxed">
              Activez profesional într-un domeniu provocator și inspirațional unde interacționez
              zilnic cu o multitudine de oameni din toate categoriile și tipologiile sociale, atât
              cu ei cât și cu emoțiile, stările, trăirile și poveștile lor. Sunt coordonator al unui
              centru de informare pentru patrimoniu și cultură și promovez din această postură
              istoria, valorile și oferta turistică și culturală a comunității locale. Sunt
              îndrăgostit iremediabil de peisajul nostru mioritic, de tainele Țării Bârsei și ale
              Cetății Râșnov, de legendele și istoriile locului. Dacă talentul m-a croit artist,
              profesia m-a transformat treptat în povestitor și mai apoi într-un fel de colecționar,
              mai întâi de istorii, după de hărți.
            </p>
          </div>
        </div>
      </section>

      {/* Hărțile Section */}
      <section className="bg-muted px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-accent-orange mb-8 text-3xl font-bold text-balance md:text-4xl">
            Hărțile
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-6 text-justify text-xl leading-relaxed">
              Da, hărțile sunt opere de artă grafice și veritabile biblioteci vizuale care îți
              descoperă tainele trecutului, dacă știi să le citești. Le-am colecționat, le-am
              înțeles, apoi le-am restaurat, reconstituit digital și îmbogățit grafic, păstrând
              tonul, atmosfera și estetica nealterate, în total acord cu limbajul autentic al
              hărții. Dpdv. cartografic, totul a rămas fidel 100% originalului, sunt la fel, dar
              mult mai frumoase vizual și artistic. Își doresc să fie înrămate și expuse, vor să
              „strălucească” exact așa cum merită. Nu sunt foarte multe, pentru că tot acest proces
              de „restaurare” digitală este unul de lungă durată, dar sunt foarte speciale.
            </p>
            <p className="text-muted-foreground text-justify text-xl leading-relaxed">
              Cu timpul, colecțiunea pentru hărți și mai ales dorința de a afla istoriile
              incredibile din spatele lor, de a descoperi și împărtăși și altora secretele pe care
              le încifrează și-a găsit adăpost într-o casa nouă și primitoare, care se numește acum
              hartiromania.ro. Aici am transpus dragostea mea pentru artă, hărți, legende și
              istorii, formulând un concept grafic din care s-au „născut” până acum hărțile,
              vederile de colecție, o carte deosebită și ideea unei arhive digitale. Aceasta va
              cuprinde o selecție specială de hărți vechi digitalizate remastered la rezoluție bună,
              disponibilă oaspeților care ne vizitează pe site și comandă produsele noastre.
            </p>
          </div>
        </div>
      </section>

      {/* Vederile Section */}
      <section className="bg-background px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-accent-orange mb-8 text-3xl font-bold text-balance md:text-4xl">
            Vederile
          </h2>
          <p className="text-muted-foreground text-justify text-xl leading-relaxed">
            Printre hărți am descoperit și un alt tip de document vechi unic. Nu prea ai cum să fii
            pasionat de frumos și ideea de vintage sau retro, și să nu-ți placă vederile. Dacă
            iubești România și istoria neamului nostru, știi că am avut domnitori și eroi legendari.
            Ei m-au inspirat și așa s-a născut acest set care strălucește ca o scânteie de inimă
            românească într-o negură a înstrăinării, care ne dă târcoale ca o molimă. Potrivite
            pentru adulți și esențiale pentru copii (având în vedere ce se întâmplă prin noile
            manuale de istorie), vederile cu poveștile celor mai iubiți Voievozi, Domni și Regi ai
            României, ne aduc aminte cine suntem. Valori, demnitate, repere!
          </p>
        </div>
      </section>

      {/* Cartea Section */}
      <section className="bg-muted px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-accent-orange mb-8 text-3xl font-bold text-balance md:text-4xl">
            Cartea
          </h2>
          <p className="text-muted-foreground text-justify text-xl leading-relaxed">
            Pasiunea pentru povești s-a transformat în mod natural și firesc în dorința de a culege,
            rafina și duce mai departe poveștile, istorioarele și legendele inedite ale ținutului și
            ale oamenilor. Așa s-a născut ideea de bază a proiectului hartiromania și mai apoi aceea
            unei cărți care să cuprindă atât legendele locale, cât și istoria impresionantă din
            spatele lor, toate redate, prezentate și mai ales ilustrate într-o manieră artistică
            creativă. De aspectul vizual s-a ocupat fiica mea, Taisia, care avea atunci 12 ani și
            era deja implicată în meșteșugul original al picturii artizanale pe pietre. Ea este unul
            dintre copiii noștri talentați, care a dorit să-și aducă contribuția personală în
            proiectul de suflet dedicat cărții. Taisia a adus o nouă viziune artistică legendelor și
            a transformat acest produs într-un soi de bestseller local.
          </p>
        </div>
      </section>

      {/* Familie - Comunitate Section */}
      <section className="bg-background px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-accent-orange mb-8 text-3xl font-bold text-balance md:text-4xl">
            Familie - Comunitate
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-6 text-justify text-xl leading-relaxed">
              Hartiromania.ro atât pe site, cât și prin paginile de social media cu același nume,
              își propune să coaguleze o comunitate de oameni faini, care să crească frumos și să
              călătorească împreună în marea aventură de explorare a tainelor și misterelor istorice
              și cartografice. Cum spuneam la început, suntem o familie și tot ceea ce am reușit să
              fac a fost datorită susținerii lor. Taisia a realizat toate ilustrațiile pentru carte,
              fiul meu a făcut singur tot site-ul acesta și se ocupă de administrarea lui și de
              editare grafică când este nevoie, Maria urmează un curs de marketing pentru social
              media și dorește să administreze și să publice conținutul și să țină legătura cu voi,
              cei mici se miră și se entuziasmează de efortul nostru comun, iar iubita mea soție mă
              susține cu dragoste și înțelegere. Nu este simplu și nici ușor, deoarece volumul de
              muncă și provocările sunt mari. Sperăm totuși ca ceea ce facem și noi să conteze în
              marea lucrare de a renaște dragostea pentru frumos și autentic, pentru valorile
              esențiale, pentru Istorie, Neam și Țară. Mulțumim partenerilor cu care colaborăm
              foarte bine de ani de zile și vouă mai ales. Acest proiect a crescut doar într-un
              singur fel, cu susținerea și ajutorul vostru. Fie că a fost o comandă sau un share,
              toate au contat. Doamne ajută să putem continua, să creștem împreună o comunitate
              adevărată de oameni pasionați și să devenim un brand de referință pe acest segment în
              România!
            </p>
          </div>
        </div>
      </section>

      {/* Main Story */}

      <Footer />
    </div>
  );
}
