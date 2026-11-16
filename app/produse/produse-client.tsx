"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import { readableTextOn } from "@/lib/utils";

export default function ProdusePage() {
  const categories = PRODUCT_CATEGORIES;

  return (
    <div className="min-h-screen">
      <Header />

      {/* Page Header */}
      <section className="relative px-4 py-16">
        <Image
          src="/images/fasie-tracia-bizantina.webp"
          alt="Background image"
          fill
          className="object-cover object-center"
          priority={true}
          quality={85}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="mb-4 text-4xl font-bold text-lime-50 drop-shadow-lg md:text-6xl">
            Colecția noastră
          </h1>
          <p className="mx-auto max-w-2xl text-2xl leading-relaxed font-semibold text-pretty text-white drop-shadow-lg md:text-3xl">
            {
              "Explorați cele trei categorii principale și afundați-vă în mrejele captivante ale istoriei"
            }
          </p>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="container mx-auto">
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
                  {/* </CHANGE> */}
                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="text-card-foreground group-hover:text-accent-orange mb-2 text-2xl font-bold transition-colors">
                      {category.title}
                    </h2>
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
        </div>
      </section>

      <Footer />
    </div>
  );
}
