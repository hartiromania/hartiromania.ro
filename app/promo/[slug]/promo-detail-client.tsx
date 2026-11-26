"use client";
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
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { itemParams, track } from "@/lib/analytics";
import type { PromoPackage } from "@/lib/types";

export function PromoDetailClient({ promoPackage }: { promoPackage: PromoPackage }) {
  useEffect(() => {
    track("view_item", itemParams(promoPackage));
  }, [promoPackage]);

  const trackOrderClick = () =>
    track("click_emag", { ...itemParams(promoPackage), link_url: promoPackage.orderLink ?? "" });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showBonusPopup, setShowBonusPopup] = useState(false);
  const [selectedBonusImage, setSelectedBonusImage] = useState<string | null>(null);

  const imageUrls = useMemo(() => promoPackage.images.map((img) => img.url), [promoPackage.images]);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-foreground mb-16 text-center text-4xl font-bold md:text-5xl">
          {promoPackage.title}
        </h1>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {promoPackage.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="bg-card relative aspect-[4/3] overflow-hidden rounded-lg">
                      <ImageMagnifier
                        src={image.url || "/placeholder.svg"}
                        alt={image.alt}
                        onClick={() => setSelectedImage(image.url)}
                        priority={index === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
              <CarouselThumbnails images={imageUrls} />
            </Carousel>

            {promoPackage.hasGift && promoPackage.giftProduct && (
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
                      Pachetul vine cu o surpriză specială - o colecție de vederi bonus din partea
                      noastră!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {promoPackage.availableSoon && (
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

          <div className="flex flex-col space-y-4 lg:space-y-8">
            {/* Price */}
            <div className="from-card to-muted/30 border-border/50 rounded-2xl border bg-gradient-to-br p-2 shadow-sm md:p-8 md:px-8 md:py-8">
              <div className="text-accent-orange mb-1 text-2xl font-bold md:text-3xl">
                {promoPackage.price}
              </div>
              <p className="text-muted-foreground text-sm md:text-lg">Prețul include TVA</p>
            </div>

            <div className="block lg:hidden">
              {promoPackage.orderLink ? (
                <Link
                  href={promoPackage.orderLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackOrderClick}
                >
                  <Button
                    size="lg"
                    className="bg-accent-orange hover:bg-accent-orange-dark text-accent-orange-foreground w-full cursor-pointer py-6 text-xl font-semibold"
                  >
                    {promoPackage.orderButtonText || "Comandă"}
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  className="bg-accent-orange hover:bg-accent-orange-dark text-accent-orange-foreground w-full cursor-pointer py-6 text-xl font-semibold"
                >
                  {promoPackage.orderButtonText || "Comandă"}
                </Button>
              )}
            </div>

            {/* Description */}
            <div className="from-card to-muted/30 border-border/50 rounded-2xl border bg-gradient-to-br p-2 shadow-sm md:p-8">
              <h2 className="text-foreground mb-2 flex items-center gap-2 text-xl font-semibold md:mb-4 md:text-2xl">
                <div className="bg-accent-orange h-6 w-1 rounded-full"></div>
                Descriere
              </h2>
              <div className="text-muted-foreground space-y-4 text-justify text-base leading-snug md:text-lg md:leading-relaxed">
                {promoPackage.longDescription ? (
                  promoPackage.longDescription
                    .split("\n\n")
                    .map((paragraph, index) => <p key={index}>{paragraph}</p>)
                ) : (
                  <p>{promoPackage.description}</p>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="from-muted/20 to-card border-border/30 rounded-2xl border bg-gradient-to-br p-2 md:p-6">
              <h3 className="text-foreground mb-2 text-base font-semibold md:mb-4 md:text-lg">
                Specificații
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs md:gap-4 md:text-sm">
                {promoPackage.specifications.map((spec, index) => {
                  const shouldSpanTwoColumns =
                    spec.label === "Material" || spec.label === "Ambalaj";

                  return (
                    <div key={index} className={shouldSpanTwoColumns ? "col-span-2" : ""}>
                      <span className="text-muted-foreground">{spec.label}:</span>
                      <p className="font-medium">{spec.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="block py-2 lg:hidden">
              <div className="via-border h-[2px] bg-gradient-to-r from-transparent to-transparent"></div>
            </div>

            <div className="hidden lg:block">
              {promoPackage.orderLink ? (
                <Link
                  href={promoPackage.orderLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackOrderClick}
                >
                  <Button
                    size="lg"
                    className="bg-accent-orange hover:bg-accent-orange-dark text-accent-orange-foreground w-64 cursor-pointer self-start py-6 text-xl font-semibold"
                  >
                    {promoPackage.orderButtonText || "Comandă"}
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  className="bg-accent-orange hover:bg-accent-orange-dark text-accent-orange-foreground w-64 cursor-pointer self-start py-6 text-xl font-semibold"
                >
                  {promoPackage.orderButtonText || "Comandă"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {promoPackage.storyContent && (
          <div className="from-card to-card/80 border-border/50 mt-16 rounded-xl border bg-gradient-to-br p-4 text-justify md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-accent-orange h-6 w-1 rounded-full"></div>
              <h2 className="text-card-foreground text-2xl font-bold md:text-3xl">
                {promoPackage.storyTitle || "Descriere"}
              </h2>
            </div>
            <div
              className="prose prose-lg text-muted-foreground max-w-none space-y-4 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: promoPackage.storyContent }}
            />
          </div>
        )}
      </div>

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

      {showBonusPopup && promoPackage.giftProduct && (
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
                  {promoPackage.giftProduct.title}
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
                <p>{promoPackage.giftProduct.description}</p>
              </div>

              <div className="mb-6">
                <Carousel className="w-full">
                  <CarouselContent>
                    {promoPackage.giftProduct.images.map((image, index) => (
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
                  <CarouselThumbnails
                    images={promoPackage.giftProduct.images.map((img) => img.url)}
                  />
                </Carousel>
              </div>

              <div className="text-center">
                <Link href={promoPackage.giftProduct.link}>
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
