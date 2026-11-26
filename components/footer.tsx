import Link from "next/link";
import { Facebook, Instagram, Twitter } from "@/components/brand-icons";
import Image from "next/image";
import { navigationItems } from "@/lib/navigation";
import { NewsletterForm } from "@/components/newsletter-form";
import { CookieSettingsButton } from "@/components/cookie-consent";

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

export function Footer() {
  return (
    <>
      <div className="bg-background px-4 pt-3 pb-1">
        <p className="text-foreground mx-auto mt-[22px] max-w-4xl py-0 pt-0 text-center font-serif text-sm leading-relaxed font-bold tracking-wide italic md:text-lg">
          Poveștile adevărate-s mai faine decât cele inventate și hărțile reale mai tari decât cele
          virtu@le
        </p>
      </div>

      <footer className="bg-card border-border mt-10 border-t">
        <div className="container mx-auto px-4 py-8 pt-[32]">
          <div className="border-border mb-6 border-b pb-6">
            <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-4 md:grid-cols-2 md:gap-10">
              <div className="text-center md:text-left">
                <h3 className="mb-1 font-semibold text-orange-900 md:text-2xl">
                  Abonează-te la newsletter
                </h3>
                <p className="text-muted-foreground md:text-lg">
                  Fii la curent cu toate produsele noi și postările de pe blog.
                </p>
              </div>
              <div>
                <NewsletterForm variant="footer" source="footer" className="text-left" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-4 flex items-center space-x-2">
              <Image
                src="/logo-principal-no-bg-cropped.png"
                alt="Hărți România Logo"
                width={100}
                height={80}
                className="object-contain"
                loading="lazy"
                quality={85}
              />
              <span className="text-xl font-bold whitespace-nowrap text-gray-900 md:text-3xl">
                HĂRȚI ROMÂNIA
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-4">
            {/* Description */}
            <div className="col-span-1 md:col-span-2">
              <p className="text-muted-foreground text-justify text-lg leading-relaxed md:text-xl">
                Proiectul hartiromania.ro este pornit din pasiune autentică pentru hărți și pentru
                istoria nefalsificată a poporului român, pe care vă invităm cu drag și încredere să
                o descoperiți. Fiecare produs al nostru a fost cu adevărat muncit la nivel de
                detaliu iar asta se vede. Iubim România românește așa ca voi și pentru că împărtășim
                aceleași valori, vă mulțumim!
              </p>
            </div>

            <div className="col-span-1 grid grid-cols-1 gap-6 md:col-span-2 md:ml-auto md:grid-cols-2 md:pr-8 md:pl-8">
              {/* Quick Links */}
              <div>
                <h3 className="mb-4 font-semibold text-orange-900 md:text-2xl">Pagini</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {navigationItems.slice(0, 3).map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-muted-foreground hover:text-primary transition-colors md:text-xl"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  {navigationItems.length > 3 && (
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {navigationItems.slice(3, 6).map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="text-muted-foreground hover:text-primary transition-colors md:text-xl"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                  {navigationItems.length > 6 && (
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {navigationItems.slice(6).map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="text-muted-foreground hover:text-primary transition-colors md:text-xl"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="mt-2">
                    <Link
                      href="https://ko-fi.com/hartiromania"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block transition-opacity hover:opacity-80"
                    >
                      <img
                        width="180"
                        height="40"
                        style={{ border: "0px", objectFit: "contain" }}
                        src="/images/kofi-support-button.webp"
                        alt="Support me on Ko-fi"
                      />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="mb-4 font-semibold text-orange-800 md:text-2xl">Contact</h3>
                <ul className="text-muted-foreground space-y-2 md:text-xl">
                  <li>Email: contact@hartiromania.ro</li>
                  <li>Telefon: +40 756 705 633</li>
                </ul>
                <div className="mt-4 flex space-x-3">
                  <Link
                    aria-label="Hărți România pe Facebook"
                    href="https://www.facebook.com/profile.php?id=61580871537631"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#d2691e] transition-colors hover:text-[#b8591a]"
                  >
                    <Facebook className="h-6 w-6 md:h-8 md:w-8" />
                  </Link>
                  <Link
                    aria-label="Hărți România pe Instagram"
                    href="https://www.instagram.com/hartiromania/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#d2691e] transition-colors hover:text-[#b8591a]"
                  >
                    <Instagram className="h-6 w-6 md:h-8 md:w-8" />
                  </Link>
                  <Link
                    aria-label="Hărți România pe X"
                    href="https://x.com/HartiRomania"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#d2691e] transition-colors hover:text-[#b8591a]"
                  >
                    <Twitter className="h-6 w-6 md:h-8 md:w-8" />
                  </Link>
                  <Link
                    aria-label="Hărți România pe Telegram"
                    href="https://t.me/hartiromania"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#d2691e] transition-colors hover:text-[#b8591a]"
                  >
                    <TelegramIcon className="h-6 w-6 md:h-8 md:w-8" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="border-border mt-8 border-t pt-8 text-center">
            <p className="text-muted-foreground font-medium md:text-xl">
              © {new Date().getFullYear()} Hărți România. Toate drepturile rezervate.
            </p>
            <nav
              aria-label="Informații legale"
              className="text-muted-foreground mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-base md:text-lg"
            >
              <Link
                href="/politica-de-confidentialitate"
                className="hover:text-foreground underline-offset-2 hover:underline"
              >
                Politica de confidențialitate
              </Link>
              <Link
                href="/politica-cookies"
                className="hover:text-foreground underline-offset-2 hover:underline"
              >
                Politica de cookie-uri
              </Link>
              <CookieSettingsButton className="hover:text-foreground cursor-pointer underline-offset-2 hover:underline" />
            </nav>
            <p className="text-muted-foreground mt-3 text-base">
              Created by{" "}
              <Link
                href="https://www.linkedin.com/in/negus-rafail-25027928a/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground decoration-muted-foreground/60 hover:text-foreground hover:decoration-muted-foreground underline transition-colors"
              >
                Rafa
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
