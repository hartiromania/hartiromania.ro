"use client";
import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselThumbnails,
} from "@/components/ui/carousel";
import { ImageMagnifier } from "@/components/image-magnifier";
import Link from "next/link";
import Image from "next/image";
import { sortProductsByUploadOrder } from "@/lib/search-utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";

export function ProductDetailClient({
  product,
  hartiProducts: hartiProductsRaw,
}: {
  product: Product;
  hartiProducts: Product[];
}) {
  const category = product.category;
  const slug = product.slug;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showBonusPopup, setShowBonusPopup] = useState(false);
  const [selectedBonusImage, setSelectedBonusImage] = useState<string | null>(null);

  const hartiProducts = useMemo(() => {
    if (category !== "harti") return [];
    return sortProductsByUploadOrder(hartiProductsRaw);
  }, [category, hartiProductsRaw]);

  const currentIndex = hartiProducts.findIndex((p) => p.slug === slug);
  const prevProduct = currentIndex > 0 ? hartiProducts[currentIndex - 1] : null;
  const nextProduct =
    currentIndex < hartiProducts.length - 1 ? hartiProducts[currentIndex + 1] : null;

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Product Title */}
        <h1 className="text-foreground mb-16 text-center text-4xl font-bold md:text-5xl">
          {product.title}
        </h1>

        <div className="flex items-start gap-8">
          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Desktop: grid 2×2 (imagine | preț+buton / descriere | specificații). Mobil: stivuit. */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Sus-stânga: Imagine & Carusel */}
              <div className="relative">
                <Carousel className="w-full">
                  <CarouselContent>
                    {product.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="bg-card relative aspect-[4/3] overflow-hidden rounded-lg">
                          <ImageMagnifier
                            src={image.url || "/placeholder.svg"}
                            alt={image.alt}
                            onClick={() => setSelectedImage(image.url)}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                  <CarouselThumbnails images={product.images.map((img) => img.url)} />
                </Carousel>

                {/* Gift Section */}
                {product.hasGift && product.giftProduct && (
                  <div
                    className="mt-6 cursor-pointer rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
                    onClick={() => setShowBonusPopup(true)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <Image
                          src="/vintage-gift-box-with-ribbon-in-sepia-tones.jpg"
                          alt="Cadou vintage"
                          width={80}
                          height={80}
                          className="object-contain"
                          quality={85}
                        />
                      </div>
                      <div>
                        <h2 className="mb-1 text-xl font-bold text-amber-800 md:text-2xl">Cadou</h2>
                        <p className="text-sm text-amber-700 md:text-base">
                          Pachetul vine cu o surpriză specială - o colecție de vederi bonus din
                          partea noastră!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Available Soon Notice */}
                {product.availableSoon && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8b4513]">
                      <span className="text-xl font-bold text-white">i</span>
                    </div>
                    <p className="text-2xl font-semibold text-green-900">
                      Disponibil pentru comenzi online în curând
                    </p>
                  </div>
                )}
              </div>

              {/* Sus-dreapta: Preț + Buton comandă (pe desktop aliniate la baza caruselului) */}
              <div className="flex flex-col gap-4 lg:justify-end lg:gap-6">
                {/* Price */}
                <div className="from-card to-muted/30 border-border/50 rounded-2xl border bg-gradient-to-br p-2 shadow-sm md:p-8 md:px-8 md:py-8">
                  <div className="text-accent-orange mb-1 text-2xl font-bold md:text-3xl">
                    {product.price}
                  </div>
                  <p className="text-muted-foreground text-sm md:text-lg">Prețul include TVA</p>
                </div>

                {/* Buton comandă (sub preț, pe toate ecranele) */}
                {product.orderLink ? (
                  <Link
                    href={product.orderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full lg:w-auto"
                  >
                    <Button
                      size="lg"
                      className="bg-accent-orange hover:bg-accent-orange-dark text-accent-orange-foreground w-full cursor-pointer py-6 text-xl font-semibold lg:w-64"
                    >
                      {product.orderButtonText || "Comandă"}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="lg"
                    className="bg-accent-orange hover:bg-accent-orange-dark text-accent-orange-foreground w-full cursor-pointer py-6 text-xl font-semibold lg:w-64"
                  >
                    {product.orderButtonText || "Comandă"}
                  </Button>
                )}
              </div>

              {/* Jos-stânga: Descriere (înălțime independentă — nu se întinde după specificații) */}
              <div className="from-card to-muted/30 border-border/50 rounded-2xl border bg-gradient-to-br p-2 shadow-sm md:p-8 lg:self-start">
                <h2 className="text-foreground mb-2 flex items-center gap-2 text-xl font-semibold md:mb-4 md:text-2xl">
                  <div className="bg-accent-orange h-6 w-1 rounded-full"></div>
                  Descriere
                </h2>
                <div className="text-muted-foreground space-y-4 text-justify text-base leading-snug md:text-lg md:leading-relaxed">
                  {product.longDescription ? (
                    product.longDescription
                      .split("\n\n")
                      .map((paragraph, index) => <p key={index}>{paragraph}</p>)
                  ) : (
                    <p>{product.description}</p>
                  )}
                </div>
              </div>

              {/* Jos-dreapta: Specificații (înălțime independentă — fără spațiu mort) */}
              <div className="from-muted/20 to-card border-border/30 rounded-2xl border bg-gradient-to-br p-2 md:p-6 lg:self-start">
                <h3 className="text-foreground mb-2 text-base font-semibold md:mb-4 md:text-lg">
                  Specificații
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs md:gap-4 md:text-sm">
                  {product.specifications.map((spec, index) => {
                    const shouldSpanTwoColumns =
                      product.category === "harti" &&
                      (spec.label === "Material" || spec.label === "Ambalaj");

                    return (
                      <div key={index} className={shouldSpanTwoColumns ? "col-span-2" : ""}>
                        <span className="text-muted-foreground">{spec.label}:</span>
                        <p className="font-medium">{spec.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Story Section */}
            {product.storyContent && (
              <div className="from-card to-card/80 border-border/50 mt-16 rounded-xl border bg-gradient-to-br p-4 text-justify md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="bg-accent-orange h-6 w-1 rounded-full"></div>
                  <h2 className="text-card-foreground text-2xl font-bold md:text-3xl">
                    {product.storyTitle || "Descriere"}
                  </h2>
                </div>
                <div
                  className="prose prose-lg text-muted-foreground max-w-none space-y-4 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.storyContent }}
                />

                {product.slug === "fabuloasa-harta-a-pamantului-plat-secolul-xiii" && (
                  <div className="border-border/30 mx-auto mt-8 max-w-2xl overflow-hidden rounded-lg border">
                    <Image
                      src="/images/psalter-map-annotated.jpg"
                      alt="Harta Psalter cu adnotări - Fabuloasa Hartă a Pământului Plat din secolul XIII cu locații și toponime marcate"
                      width={600}
                      height={800}
                      className="h-auto w-full cursor-pointer object-contain transition-opacity duration-200 hover:opacity-90"
                      quality={95}
                      onClick={() => setSelectedImage("/images/psalter-map-annotated.jpg")}
                    />
                  </div>
                )}

                {product.category === "carti" && (
                  <div className="mt-8 rounded-xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm">
                    <p className="text-muted-foreground mb-4 text-center text-base md:text-lg">
                      Link video, Taisia la 12 ani povestind despre proiectele ei și despre cum a
                      lucrat la ilustrațiile cărții
                    </p>
                    <div className="flex justify-center">
                      <Link
                        href="https://www.youtube.com/watch?v=FZiEgXqNnmQ"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="lg"
                          className="bg-accent-orange hover:bg-accent-orange-dark text-accent-orange-foreground px-8 py-3 text-lg font-semibold"
                        >
                          Vezi Video
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Harti Navigator Sidebar */}
          {category === "harti" && hartiProducts.length > 0 && (
            <aside className="hidden w-64 flex-shrink-0 xl:block">
              <div className="sticky top-8">
                <div className="bg-card border-border/50 overflow-hidden rounded-2xl border shadow-sm">
                  <div className="border-border/40 bg-muted/30 border-b px-4 py-3">
                    <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
                      Toate hărțile
                    </h3>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {currentIndex + 1} din {hartiProducts.length}
                    </p>
                  </div>

                  <nav className="divide-border/30 max-h-[70vh] divide-y overflow-y-auto">
                    {hartiProducts.map((p) => {
                      const isActive = p.slug === slug;
                      return (
                        <Link
                          key={p.id}
                          href={`/produse/harti/${p.slug}`}
                          className={`group flex items-center gap-3 px-3 py-3 transition-colors duration-150 ${
                            isActive
                              ? "bg-accent-orange/10 border-accent-orange border-l-2"
                              : "hover:bg-muted/50 border-l-2 border-transparent"
                          }`}
                        >
                          <div className="bg-muted relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={p.thumbnailImage || "/placeholder.svg"}
                              alt={p.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`line-clamp-2 text-xs leading-snug font-medium ${
                                isActive
                                  ? "text-accent-orange"
                                  : "text-foreground group-hover:text-accent-orange"
                              }`}
                            >
                              {p.shortTitle || p.title}
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-xs">{p.price}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Prev / Next navigation */}
                  <div className="border-border/40 flex border-t">
                    {prevProduct ? (
                      <Link
                        href={`/produse/harti/${prevProduct.slug}`}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted/40 border-border/40 flex flex-1 items-center justify-center gap-1 border-r py-3 text-xs font-medium transition-colors"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Anterioară
                      </Link>
                    ) : (
                      <div className="text-muted-foreground border-border/40 flex flex-1 items-center justify-center gap-1 border-r py-3 text-xs">
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Anterioară
                      </div>
                    )}
                    {nextProduct ? (
                      <Link
                        href={`/produse/harti/${nextProduct.slug}`}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted/40 flex flex-1 items-center justify-center gap-1 py-3 text-xs font-medium transition-colors"
                      >
                        Următoarea
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <div className="text-border flex flex-1 items-center justify-center gap-1 py-3 text-xs">
                        Următoarea
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative flex h-full max-h-[90vh] w-full max-w-4xl items-center justify-center">
            <Image
              src={selectedImage || "/placeholder.svg"}
              alt="Preview"
              fill
              sizes="90vw"
              className="rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
              quality={95}
              priority
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bonus Product Popup */}
      {showBonusPopup && product.giftProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setShowBonusPopup(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-foreground text-2xl font-bold md:text-3xl">
                  {product.giftProduct.title}
                </h2>
                <button
                  onClick={() => setShowBonusPopup(false)}
                  className="rounded-full bg-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="text-muted-foreground mb-6 text-base leading-relaxed md:text-lg">
                <p>{product.giftProduct.description}</p>
              </div>

              <div className="mb-6">
                <Carousel className="w-full">
                  <CarouselContent>
                    {product.giftProduct.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="bg-card relative aspect-[4/3] overflow-hidden rounded-lg">
                          <ImageMagnifier
                            src={image.url || "/placeholder.svg"}
                            alt={image.alt}
                            onClick={() => setSelectedBonusImage(image.url)}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                  <CarouselThumbnails images={product.giftProduct.images.map((img) => img.url)} />
                </Carousel>
              </div>

              <div className="text-center">
                <Link href={product.giftProduct.link}>
                  <Button
                    size="lg"
                    className="bg-accent-orange hover:bg-accent-orange-dark text-accent-orange-foreground px-8 py-3 text-lg font-semibold"
                  >
                    Vezi Pagina Produsului
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bonus Image Preview Modal */}
      {selectedBonusImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedBonusImage(null)}
        >
          <div className="relative flex h-full max-h-[90vh] w-full max-w-4xl items-center justify-center">
            <Image
              src={selectedBonusImage || "/placeholder.svg"}
              alt="Preview"
              fill
              sizes="90vw"
              className="rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
              quality={95}
              priority
            />
            <button
              onClick={() => setSelectedBonusImage(null)}
              className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
