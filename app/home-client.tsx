"use client";

import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import Image from "next/image";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import { readableTextOn } from "@/lib/utils";

export default function HomePage() {
  const categories = PRODUCT_CATEGORIES;

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16">
        <div className="absolute inset-0 scale-110">
          <Image
            src="/images/romania-mare-76-judete-fasie.jpg"
            alt="Harta istorică a României Mari cu 76 de județe"
            fill
            priority
            quality={95}
            className="object-cover object-top opacity-90"
            sizes="100vw"
          />
        </div>
        <div className="bg-card/60 absolute inset-0"></div>
        <div className="to-background absolute inset-0 bg-gradient-to-b from-transparent via-transparent"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="text-accent-foreground mb-6 text-5xl font-bold text-balance md:text-7xl">
            Hai în explorare, cartografic, inițiatic,
            <span className="text-accent-orange block">de la Dacia la România Mare!</span>
          </h1>
          <p className="mx-auto max-w-4xl text-2xl leading-relaxed font-semibold text-pretty text-black md:text-4xl">
            Descoperă frânturi din istoria fabuloasă a neamului românesc și a cartografiei
            universale prin intermediul unor hărți excepționale, originale și călătorește în timpul
            eroilor de legendă, prin vederile de colecție ale voievozilor și domnitorilor noștri.
          </p>
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-4 py-16">
        <div className="container mx-auto">
          <div className="border-accent-orange/70 before:border-accent-orange/30 relative mx-auto mb-12 max-w-3xl rounded-sm border-4 border-double bg-gradient-to-b from-amber-50/40 to-transparent px-8 py-10 text-center shadow-[0_0_0_8px_rgba(255,255,255,0.5),0_0_0_12px_rgba(217,119,6,0.3)] before:absolute before:inset-0 before:m-2 before:rounded-sm before:border-2 md:px-12 md:py-12">
            <h2 className="text-accent-orange relative z-10 mb-4 text-3xl font-bold md:text-4xl">
              Produse recomandate
            </h2>
            <p className="text-muted-foreground relative z-10 mx-auto max-w-2xl text-xl leading-relaxed md:text-2xl">
              Descoperiți produsele din oferta noastră! Le puteți transforma ușor în cadoul perfect
              pentru dvs. sau persoana dragă.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {categories.map((category, index) => (
              <div key={index} className="group h-full cursor-pointer">
                <div className="bg-card border-border relative flex h-full flex-col overflow-hidden rounded-lg border shadow-sm transition-all duration-300 hover:shadow-lg">
                  <Link href={category.href} className="relative block aspect-[4/3]">
                    <Image
                      src={category.imageUrl || "/placeholder.svg"}
                      alt={category.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain object-center transition-transform duration-300 group-hover:scale-105"
                      quality={85}
                      priority={index === 0}
                    />
                    {category.itemCount && (
                      <div className="absolute right-4 bottom-4 left-4">
                        <span className="bg-accent-orange text-accent-orange-foreground mb-2 inline-block rounded-full px-3 py-1 text-xl font-semibold tracking-wide">
                          {category.itemCount}
                        </span>
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-card-foreground group-hover:text-accent-orange mb-2 text-2xl font-bold transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 flex-1 text-center leading-relaxed">
                      {category.description}
                    </p>
                    <Link href={category.href}>
                      <Button
                        className="text-accent-orange-foreground w-full cursor-pointer text-lg font-semibold tracking-wide transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: category.buttonColor || "#a0501a",
                          color: readableTextOn(category.buttonColor || "#a0501a"),
                        }}
                        onMouseEnter={(e) => {
                          if (category.buttonColor) {
                            e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${category.buttonColor} 85%, black)`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (category.buttonColor) {
                            e.currentTarget.style.backgroundColor = category.buttonColor;
                          }
                        }}
                      >
                        {category.buttonText}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/produse">
              <Button
                size="lg"
                className="cursor-pointer bg-[#925d4a] px-8 py-4 text-xl text-white shadow-md transition-colors hover:cursor-pointer hover:bg-[#7a4736]"
              >
                Vezi toate produsele
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="bg-card px-4 py-16">
        <div className="container mx-auto max-w-3xl">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.2fr,0.8fr] lg:gap-10">
            <div className="order-2 lg:order-1 lg:px-8 xl:px-12">
              <h2 className="text-accent-orange mb-6 text-3xl font-bold md:text-4xl">
                Istorii fascinante - Știați că...?{" "}
              </h2>
              <p className="text-muted-foreground mb-6 text-justify leading-relaxed">
                Imaginați-vă o lume uluitoare a cartografiei din urmă cu sute de ani, când anumite
                hărți erau atât de importante încât puteau determina soarta unor regate, sau
                destinul unor imperii. Erau considerate secrete de stat fiind păzite mai bine decât
                comorile, iar existența lor era oficial negată. Altele conțineau informații atât de
                revelatoare încât cartografii rămâneau anonimi pentru a nu plăti cu viața prețul
                acestei expuneri. Teritoriul cartografiei interzise sau ascunse deliberat, este un
                soi de Terra Incognita pentru noi cei de acum.
              </p>
              <p className="text-muted-foreground mb-6 text-justify leading-relaxed">
                În prezent, sunt oameni care trăiesc cu impresia că cei din vechime, erau înapoiați,
                mai limitați și mai înguști la minte decât noi, cei care ne aflăm acum pe culmile
                progresului și ale civilizației. Îi cataloghează și înghesuie la grămadă sub
                eticheta de medievali dintr-un oarecare Ev Mediu întunecat.
              </p>
              <p className="text-muted-foreground mb-6 text-justify leading-relaxed">
                Această impresie despre cei din vechime, e fundamental eronată și greșită. Da,
                oamenii aceia aveau anumite limitări, dar raportat la nivelul descoperirilor și al
                avansului tehnologic de atunci, prin comparație cu ce aven noi acum, putem spune că
                ei erau mult mai „smart” decât ne imaginăm.. În aproape toate domeniile,
                „medievalii” ăștia erau sclipitori și creativi. De la artă, sub toate formele ei, la
                muzică, literatură, tipografie, agricultură, arta războiului, arhitectură și mai
                ales inginerie și construcții, mecanică, astronomie, navigație, matematică și până
                la meșteșuguri și cartografie.
              </p>
              <p className="text-muted-foreground mb-6 text-justify leading-relaxed">
                Multe dintre realizările lor sunt și acum „mindblowing” pentru noi și cu toată
                tehnologia de acum, nu putem să reproducem sau să construim ceea ce au reușit ei.
                Asta a lăsat loc multor speculații și teorii, iar misterele și enigmele trecutului
                sunt fascinante și tot mai multe datorită noilor tehnologii de vârf, al
                descoperirilor recente și al arheologiei moderne care folosește spre ex. scanări
                laser profesionale de adâncime etc.
              </p>
              <p className="text-muted-foreground mb-6 text-justify leading-relaxed">
                Cartografia nu a făcut excepție nici ea, este un domeniu incredibil de frumos și
                captivant, plin de mistere și taine încă nedezlegate. De la continente, țări sau
                imperii dispărute sau prea puțin analizate (Tartaria, Khazaria, Antartica etc.), la
                rase umanoide diferite și creaturi enigmatice, comori ascunse, civilizații avansate,
                până la misterele Hiperboreei și ale Arcticii, ale firmamentului/domului și
                pământului plat, toate acestea și multe alte istorii se regăsesc într-un fel sau
                altul, mai mult sau mai puțin, ascunse în imaginile sau textele hărților.
              </p>
              <p className="text-muted-foreground mb-6 text-justify leading-relaxed">
                Ele aprind imaginația internauților moderni care susțin diverse teorii de tip
                „conspirații” și se lansează în dezbateri nesfârșite pe teme actuale precum, mud
                flood, the great reset, enigmele Tartariei și ale Polului Nord, Ether&amp;Free
                Energy, civilizații extraterestre și tehnologii antice secrete, etc.
              </p>
              <p className="text-muted-foreground mb-8 text-justify leading-relaxed">
                Să nu înghiți totul pe nemestecate, dar să rămâi totuși open minded receptiv,
                deschis și interesat. Aici vrem noi să ne situăm, cu moderație și decență ne dorim
                să deslușim mistere cartografice, istorice și să le abordăm și din perspectiva
                noilor teorii când este cazul.
              </p>
              <p className="text-muted-foreground mb-8 text-justify leading-relaxed">
                Vom face asta exclusiv pe paginile de social media hartiromania.ro unde vă invităm
                să ne vizitați, deoarece avem o super colecție bogată de hărți vechi excepționale
                (hărți ale pământului plat, ale interiorului pământului, altele care redau creaturi
                marine și monștrii acvatici sau tereștrii, de la sirene la dragoni și de la zei la
                centauri și inorogi, de la rase umanoide incredibile la amazoane și evenimente
                spirituale și cartografieri uluitoare, celeste sau ale unor teritorii misterioase
                etc.), pe care le vom analiza și explora împreună prin postări dedicate, în premieră
                în limba română și pentru România. Încheiem această rubrică cu o vorbă de duh,
                „pentru că toate teoriile conspirației sau dovedit până la urmă a fi adevărate, avem
                acum nevoie de altele noi”.
              </p>
              <Link href="/despre">
                <Button className="cursor-pointer px-6 py-3 text-lg hover:cursor-pointer">
                  Citește povestea noastră
                </Button>
              </Link>
            </div>
            <div className="order-1 lg:sticky lg:top-24 lg:order-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg shadow-lg lg:aspect-[3/4]">
                <Image
                  src="/watermark-harti/fabuloasa-harta-a-pamantului-plat-secolul-xiii-wt.jpg"
                  alt="Colecția de hărți și vederi"
                  fill
                  sizes="(max-width: 1024px) 100vw, 24rem"
                  className="object-cover object-top"
                  loading="lazy"
                  quality={85}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Romanian Brand Pride Section */}
      <section className="bg-muted px-4 py-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/assets/cetatea-rasnov-din-carte.webp"
                alt="Ilustrație artistică a Cetății Râșnov cu munții în fundal și dragon decorativ - din cartea Legende, Istorii, Comori"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
                loading="lazy"
                quality={85}
              />
            </div>
            <div className="text-muted-foreground mb-8 text-justify leading-relaxed">
              <h2 className="text-accent-orange mb-6 text-center text-3xl font-bold text-balance md:text-4xl">
                Brand românesc – Produse autentice
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Considerăm că într-o piață hiperglobalizată și dominată de consorții și investiții
                străine (care sunt firești și necesare dacă respectă anumite condiții), este
                absolută nevoie să formăm și consolidăm o viziune social-economică de încurajare și
                dezvoltare a producătorilor, dezvoltatorilor și afaceriștilor români. Dacă
                antreprenoriatul românesc este încurajat și lor le va merge bine, economic lucrurile
                vor fi mai bune pentru România. Asta se vede peste tot în lume unde sunt zone și
                regiuni întregi care înfloresc dpdv. economic, în care aproape toată lumea trăiește
                din propriile afaceri de familie.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Totul pleacă întâi de la perceptie, haideți să încurajăm producătorii autohtoni și
                micii antreprenori locali, să-i susținem promovând și cumpărând produsele lor.
                Schimbarea adevărată începe de jos, de la firul ierbii, haideți să punem și noi
                umărul atât cât putem.
              </p>
              <p className="text-muted-foreground mb-8 text-justify leading-relaxed">
                Hartiromania.ro este un proiect 100% românesc. Ne străduim să păstrăm și promovăm
                patrimoniul cultural național și valorile istorice, artistice, morale și spirituale
                ale Neamului Românesc. Calitatea și autenticitatea sunt valorile fundamentale care
                ne ghidează în selectarea produselor noastre, pe care voi le apreciați. Vă mulțumim!
              </p>
              <div className="flex items-center gap-4">
                <div className="relative h-8 w-12 overflow-hidden rounded">
                  <div className="absolute inset-0 flex">
                    <div className="w-1/3 bg-blue-600"></div>
                    <div className="w-1/3 bg-yellow-400"></div>
                    <div className="w-1/3 bg-red-600"></div>
                  </div>
                </div>
                <span className="text-m text-accent-orange font-semibold">
                  Produse 100% Românești
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
