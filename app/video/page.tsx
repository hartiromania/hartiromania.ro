import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Video",
  description:
    "Povești despre hărți, istorie și oamenii din spatele proiectului Hărți România, în imagini.",
  path: "/video",
});

export default function VideoPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16">
        <Image
          src="/assets/triolorul-romanesc-mai-lung.webp"
          alt="Drapelul României - secțiune video"
          fill
          sizes="100vw"
          className="object-cover"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-black/0"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-lg md:text-5xl">Video</h1>
          <p className="mx-auto max-w-2xl text-2xl leading-relaxed font-semibold text-pretty text-white/90 drop-shadow-lg md:text-3xl">
            Descoperă poveștile noastre prin imagini în mișcare
          </p>
        </div>
      </section>

      {/* Video Content Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto">
          <div className="space-y-16">
            {/* First Video - Andrei */}
            <div className="mx-auto max-w-4xl">
              <div className="bg-muted mb-6 aspect-video overflow-hidden rounded-lg">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/BwzXh7bsOPs"
                  title="ANDREI - Omul cu Povești"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <h2 className="text-foreground mb-3 text-2xl font-bold">Andrei – Omul cu Povești!</h2>
              <p className="text-muted-foreground leading-relaxed">
                Proiectul hartiromania.ro s-a născut din pasiune autentică. Câteva scântei de suflet
                și frânturi de poveste, vă încântă sufletul aici.
              </p>
            </div>

            {/* Second Video - Taisia */}
            <div className="mx-auto max-w-4xl">
              <div className="bg-muted mb-6 aspect-video overflow-hidden rounded-lg">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/FZiEgXqNnmQ"
                  title="TAISIA - Artistă la 12 ani"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <h2 className="text-foreground mb-3 text-2xl font-bold">
                Taisia – Artistă la 12 ani!
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Taisia la 12 ani povestind cu sincerulitatea și inocența specifică vârstei, despre
                proiectele ei și despre cum a lucrat la ilustrațiile cărții.
              </p>
            </div>

            {/* Third Video - Comorile Străbunilor */}
            <div className="mx-auto max-w-4xl">
              <div className="bg-muted mb-6 aspect-video overflow-hidden rounded-lg">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/TTCyUXdhs2s"
                  title="Comorile străbunilor - Dă sens vieții cu Ionică Herlea"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <h2 className="text-foreground mb-3 text-2xl font-bold">Comorile Străbunilor</h2>
              <p className="text-muted-foreground leading-relaxed">
                Andrei, omul din spatele proiectului hartiromania.ro și Mihai Dragomir, președintele
                Asociației Mioritics, povestind despre proiecte frumoase care au prins viață la
                Râșnov.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
