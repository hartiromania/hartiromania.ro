"use client";

import type React from "react";
import Image from "next/image";
import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Facebook, Instagram, Twitter } from "@/components/brand-icons";

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: result.message || "Mesajul a fost trimis cu succes!",
        });
        // Reset form on success
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "A apărut o eroare la trimiterea mesajului",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Eroare de conexiune. Vă rugăm să încercați din nou.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16">
        <Image
          src="/assets/papirus-fundal.webp"
          alt="Vintage parchment background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/0"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-lg md:text-5xl">
            Contactați-ne
          </h1>
          <p className="mx-auto max-w-2xl text-2xl leading-relaxed font-semibold text-pretty text-white drop-shadow-lg md:text-3xl">
            Suntem aici să vă răspundem la orice întrebări despre colecția noastră de hărți, vederi
            istorice sau cărți
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="px-4 py-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-stretch">
            {/* Contact Form */}
            <Card className="w-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Trimiteți-ne un mesaj</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitStatus.type && (
                    <div
                      className={`rounded-md p-4 ${
                        submitStatus.type === "success"
                          ? "border border-green-200 bg-green-50 text-green-800"
                          : "border border-red-200 bg-red-50 text-red-800"
                      }`}
                    >
                      {submitStatus.message}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="text-foreground mb-2 block text-xl font-medium"
                      >
                        Nume complet
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Introduceți numele dvs."
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="text-foreground mb-2 block text-xl font-medium"
                      >
                        Adresa de email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@exemplu.ro"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="text-foreground mb-2 block text-xl font-medium"
                    >
                      Subiect
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Subiectul mesajului"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="text-foreground mb-2 block text-xl font-medium"
                    >
                      Mesaj
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Scrieți mesajul dvs. aici..."
                      rows={6}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="mt-6 w-full cursor-pointer bg-teal-700 text-xl hover:bg-teal-800"
                    disabled={isLoading}
                  >
                    {isLoading ? "Se trimite..." : "Trimite mesajul"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8 lg:flex lg:h-full lg:flex-col">
              <Card className="lg:h-auto">
                <CardHeader>
                  <CardTitle className="text-2xl">Informații de contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h2 className="text-foreground mb-2 font-semibold">Email</h2>
                    <p className="text-teal-700">contact@hartiromania.ro</p>
                  </div>

                  <div>
                    <h2 className="text-foreground mb-2 font-semibold">Telefon</h2>
                    <p className="text-teal-700">+40 756 705 633</p>
                  </div>

                  <div>
                    <h2 className="text-foreground mb-3 font-semibold">Urmăriți-ne și pe</h2>
                    <div className="flex gap-4">
                      <a
                        aria-label="Hărți România pe Facebook"
                        href="https://www.facebook.com/profile.php?id=61580871537631"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 transition-colors hover:text-teal-800"
                      >
                        <Facebook className="h-6 w-6" />
                      </a>
                      <a
                        aria-label="Hărți România pe Instagram"
                        href="https://www.instagram.com/hartiromania/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 transition-colors hover:text-teal-800"
                      >
                        <Instagram className="h-6 w-6" />
                      </a>
                      <a
                        aria-label="Hărți România pe X"
                        href="https://x.com/HartiRomania"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 transition-colors hover:text-teal-800"
                      >
                        <Twitter className="h-6 w-6" />
                      </a>
                      <a
                        aria-label="Hărți România pe Telegram"
                        href="https://t.me/hartiromania"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 transition-colors hover:text-teal-800"
                      >
                        <TelegramIcon className="h-6 w-6" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Us section */}
              <Card className="lg:flex-1">
                <CardHeader>
                  <CardTitle className="text-2xl">Support us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h2 className="text-foreground mb-4 font-semibold">Susține povestea noastră!</h2>
                  <a
                    href="https://ko-fi.com/U7U41L0IW2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block cursor-pointer"
                  >
                    <img
                      src="/images/kofi-support-button.webp"
                      alt="Support me on Ko-fi"
                      style={{ height: "auto", maxWidth: "70%" }}
                      className="rounded-lg transition-transform hover:scale-105 hover:shadow-lg"
                    />
                  </a>
                </CardContent>
              </Card>

              <Card className="lg:hidden">
                <CardHeader>
                  <CardTitle className="text-3xl">Întrebări frecvente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-foreground mb-1 font-medium">
                      Hărțile se vând doar în format A3 sau și la alte mărimi mai mari?
                    </h3>
                    <p className="text-muted-foreground text-justify text-lg">
                      Toate hărțile aflate momentan la vânzare sunt pe format A3. Am ales acest
                      format deoarece este cerut de cei care comandă hărțile. Este formatul ideal,
                      suficient de mare să arate bine și suficient de mic să încapă în spațiul liber
                      disponibil pe perete și se pretează foarte bine la transport în tub sau mapă.
                      Totuși, deoarece avem o colecție impresionantă de hărți vechi, rare și care se
                      pretează la print doar pentru formate mari (au un volum uriaș de informație și
                      arată superb la format A1 spre ex.), luăm în considerare disponibilitatea lor
                      la comandă în viitor pe mărimi A2 sau A1.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-foreground mb-1 font-medium">
                      Ambalajele hărților, rezistă la transport, vor ajunge întregi hărțile la
                      destinație?
                    </h3>
                    <p className="text-muted-foreground text-justify text-lg">
                      Din experiența de până acum, nu am avut nici o comandă la care harta sau
                      hărțile să fi ajuns deteriorate. Exact din acest motiv, am dezvoltat un tub
                      „handmade”, unic și original care să reziste mult mai bine la șocuri mecanice
                      decât orice alt tub disponibil în librării, sau în depozitele de papetărie din
                      România. Este cu diametru îngust, din plastic dur, gros și are capace din
                      plastic care etanșează perfect. La comenzile hărților în mapă, întotdeauna
                      suplimentar protejăm mapa cu 2 coli de carton gros și învelim totul în folie
                      pentru extra protecție, să facă față la orice tip de umiditate.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-foreground mb-1 font-medium">
                      Hărțile și produsele dvs. pot fi cumpărate și din anumite locații fizice sau
                      doar online?
                    </h3>
                    <p className="text-muted-foreground text-justify text-lg">
                      Chiar dacă doar unele se găsesc în alte locații, toate produsele noastre pot
                      fi comandate fizic în Râșnov și sunt disponibile în grădina Cetății Râșnov
                      (până la finalizarea lucrărilor de restaurare, când vom reveni în Turnul
                      Gărzii în incinta „Cetății de Sus”, centrul nostru de informare funcționează
                      temporar improvizat). Când vremea (suntem afară într-un cort medieval) și
                      programul ne permite, suntem jos în grădina cetății și vă așteptăm cu drag.
                      Dacă poposiți la Râșnov, doriți să achiziționați produsele noastre și nu
                      ne-ați găsit în cetate, contactați-ne și încercăm să găsim o rezolvare.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mx-auto mt-12 hidden max-w-4xl lg:block">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Întrebări frecvente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-foreground mb-1 font-medium">
                    Hărțile se vând doar în format A3 sau și la alte mărimi mai mari?
                  </h3>
                  <p className="text-muted-foreground text-justify text-lg">
                    Toate hărțile aflate momentan la vânzare sunt la mărime A3. Am ales acest format
                    deoarece este cerut de cei care comandă hărțile. Este formatul ideal, suficient
                    de mare să arate bine și suficient de mic să încapă în spațiul liber disponibil
                    pe perete și se pretează foarte bine la transport în tub sau mapă. Totuși,
                    deoarece avem o colecție impresionantă de hărți vechi, rare și care se pretează
                    la print doar pentru formate mari (au un volum uriaș de informație și arată
                    superb la format A1 spre ex.), luăm în considerare disponibilitatea lor la
                    comandă în viitor pe mărimi A2 sau A1.
                  </p>
                </div>
                <div>
                  <h3 className="text-foreground mb-1 font-medium">
                    Ambalajele hărților, rezistă la transport, vor ajunge întregi hărțile la
                    destinație?
                  </h3>
                  <p className="text-muted-foreground text-justify text-lg">
                    Din experiența de până acum, nu am avut nici o comandă la care harta sau hărțile
                    să fi ajuns deteriorate. Exact din acest motiv, am dezvoltat un tub „handmade”,
                    unic și original care să reziste mult mai bine la șocuri mecanice decât orice
                    alt tub disponibil în librării, sau în depozitele de papetărie din România. Este
                    cu diametru îngust, din plastic dur, gros și are capace din plastic care
                    etanșează perfect. La comenzile hărților în mapă, întotdeauna suplimentar
                    protejăm mapa cu 2 coli de carton gros și învelim totul în folie pentru extra
                    protecție, să facă față la orice tip de umiditate.
                  </p>
                </div>
                <div>
                  <h3 className="text-foreground mb-1 font-medium">
                    Hărțile și produsele dvs. pot fi cumpărate și din anumite locații fizice sau
                    doar online?
                  </h3>
                  <p className="text-muted-foreground text-justify text-lg">
                    Chiar dacă doar unele se găsesc în alte locații (Brașov, Sibiu, Cristian), toate
                    produsele noastre sunt disponibile fizic în Râșnov și se găsesc la standul info
                    din grădina Cetății Râșnov (până la finalizarea lucrărilor de restaurare, când
                    vom reveni în Turnul Gărzii în incinta ”Cetății de Sus”, centrul nostru de
                    informare funcționează temporar improvizat). Când vremea (suntem afară într-un
                    cort medieval) și programul ne permite, suntem jos în grădina cetății și vă
                    așteptăm cu drag. Dacă poposiți la Râșnov, doriți să achiziționați produsele
                    noastre și nu ne-ați găsit în cetate, contactați-ne și încercăm să găsim o
                    rezolvare.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
