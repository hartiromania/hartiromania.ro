"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    // Special case for Produse - also highlight when on individual product pages
    if (path === "/produse") {
      return (
        pathname.startsWith("/produse") ||
        pathname.startsWith("/vederi") ||
        pathname.startsWith("/harti") ||
        pathname.startsWith("/carti")
      );
    }
    if (path === "/promo") {
      return pathname.startsWith("/promo");
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-background border-border relative sticky top-0 z-50 border-b">
      {/* Background image with vintage maps */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{
          backgroundImage: "url('/vintage-maps-collection.jpg')",
        }}
      />
      {/* Dark overlay for better text readability */}
      <div className="from-background/80 via-background/70 to-background/80 absolute inset-0 bg-gradient-to-r" />

      <div className="relative z-10 container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo-principal-no-bg-cropped.png"
              alt="Hărți România Logo"
              width={64}
              height={48}
              className="object-contain md:h-20 md:w-30"
              priority
              quality={90}
            />
            <div className="relative">
              <span
                className="relative block text-lg font-bold tracking-wide whitespace-nowrap text-gray-900 uppercase md:text-3xl"
                style={{
                  textShadow: "1px 1px 2px rgba(255,255,255,0.8)",
                }}
              >
                HĂRȚI ROMÂNIA
              </span>
              <span
                className="absolute top-full right-0 left-0 mt-0.5 h-1 rounded-full md:mt-1"
                style={{
                  background:
                    "linear-gradient(90deg, #002b7f 0%, #002b7f 33%, #fcdd09 33%, #fcdd09 66%, #ce1126 66%, #ce1126 100%)",
                }}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          {/* Meniul complet are nevoie de ~1230px; sub xl (1280px) se folosește meniul mobil. */}
          <nav className="hidden items-center space-x-8 xl:flex">
            <Link
              href="/"
              className={`inline-block text-xl font-semibold transition-all duration-200 lg:text-2xl ${
                isActive("/")
                  ? "text-accent-orange"
                  : "text-foreground hover:text-accent-orange hover:scale-110"
              }`}
            >
              Acasă
            </Link>
            <Link
              href="/produse"
              className={`inline-block text-xl font-semibold transition-all duration-200 lg:text-2xl ${
                isActive("/produse")
                  ? "text-accent-orange"
                  : "text-foreground hover:text-accent-orange hover:scale-110"
              }`}
            >
              Produse
            </Link>
            <Link
              href="/promo"
              className={`inline-block text-xl font-semibold transition-all duration-200 lg:text-2xl ${
                isActive("/promo")
                  ? "text-accent-orange"
                  : "text-foreground hover:text-accent-orange hover:scale-110"
              }`}
            >
              Promo
            </Link>
            <Link
              href="/despre"
              className={`inline-block text-xl font-semibold transition-all duration-200 lg:text-2xl ${
                isActive("/despre")
                  ? "text-accent-orange"
                  : "text-foreground hover:text-accent-orange hover:scale-110"
              }`}
            >
              Povestea Noastră
            </Link>
            <Link
              href="/video"
              className={`inline-block text-xl font-semibold transition-all duration-200 lg:text-2xl ${
                isActive("/video")
                  ? "text-accent-orange"
                  : "text-foreground hover:text-accent-orange hover:scale-110"
              }`}
            >
              Video
            </Link>
            <Link
              href="/blog"
              className={`inline-block text-xl font-semibold transition-all duration-200 lg:text-2xl ${
                isActive("/blog")
                  ? "text-accent-orange"
                  : "text-foreground hover:text-accent-orange hover:scale-110"
              }`}
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className={`inline-block text-xl font-semibold transition-all duration-200 lg:text-2xl ${
                isActive("/contact")
                  ? "text-accent-orange"
                  : "text-foreground hover:text-accent-orange hover:scale-110"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="xl:hidden"
            aria-label={isMenuOpen ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="border-border mt-4 border-t pt-4 pb-4 xl:hidden">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className={`text-xl font-semibold transition-colors ${
                  isActive("/") ? "text-accent-orange" : "text-foreground hover:text-accent-orange"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Acasă
              </Link>
              <Link
                href="/produse"
                className={`text-xl font-semibold transition-colors ${
                  isActive("/produse")
                    ? "text-accent-orange"
                    : "text-foreground hover:text-accent-orange"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Produse
              </Link>
              <Link
                href="/promo"
                className={`text-xl font-semibold transition-colors ${
                  isActive("/promo")
                    ? "text-accent-orange"
                    : "text-foreground hover:text-accent-orange"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Promo
              </Link>
              <Link
                href="/despre"
                className={`text-xl font-semibold transition-colors ${
                  isActive("/despre")
                    ? "text-accent-orange"
                    : "text-foreground hover:text-accent-orange"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Povestea Noastră
              </Link>
              <Link
                href="/video"
                className={`text-xl font-semibold transition-colors ${
                  isActive("/video")
                    ? "text-accent-orange"
                    : "text-foreground hover:text-accent-orange"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Video
              </Link>
              <Link
                href="/blog"
                className={`text-xl font-semibold transition-colors ${
                  isActive("/blog")
                    ? "text-accent-orange"
                    : "text-foreground hover:text-accent-orange"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className={`text-xl font-semibold transition-colors ${
                  isActive("/contact")
                    ? "text-accent-orange"
                    : "text-foreground hover:text-accent-orange"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
