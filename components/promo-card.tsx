import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { readableTextOn } from "@/lib/utils";
import type { PromoPackage } from "@/lib/types";

interface PromoCardProps {
  package: PromoPackage;
}

export function PromoCard({ package: pkg }: PromoCardProps) {
  const linkUrl = `/promo/${pkg.slug}`;

  const buttonStyle = pkg.buttonColor
    ? {
        backgroundColor: pkg.buttonColor,
        color: readableTextOn(pkg.buttonColor),
        // Calculate a slightly darker shade for hover by reducing brightness by 10%
        "--hover-bg":
          pkg.buttonColor
            .replace("#", "")
            .match(/.{2}/g)
            ?.map((hex) =>
              Math.max(0, Number.parseInt(hex, 16) - 25)
                .toString(16)
                .padStart(2, "0"),
            )
            .join("") || pkg.buttonColor,
      }
    : {};

  return (
    <Card className="group flex h-full flex-col transition-shadow duration-300 hover:shadow-lg">
      <CardContent className="flex flex-1 flex-col p-0">
        <Link
          href={linkUrl}
          className="relative block aspect-square cursor-pointer overflow-hidden rounded-t-lg"
        >
          <Image
            src={pkg.thumbnailImage || "/placeholder.svg"}
            alt={pkg.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            quality={85}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            {pkg.isNew && (
              <div className="rounded-lg border border-[#15803d] bg-gradient-to-br from-[#15803d] to-[#166534] p-2 shadow-md">
                <div className="flex items-center gap-1">
                  <span className="text-xl">✨</span>
                  <span className="text-lg font-semibold tracking-[0.3px] text-white">Nou</span>
                </div>
              </div>
            )}
            {pkg.isBestSeller && (
              <div className="rounded-lg border border-[#c2410c] bg-gradient-to-br from-[#c2410c] to-[#9a3412] p-2 shadow-md">
                <div className="flex items-center gap-1">
                  <span className="text-xl">🔥</span>
                  <span className="text-lg font-semibold tracking-[0.3px] text-white">
                    Best seller
                  </span>
                </div>
              </div>
            )}
            {pkg.hasGift && (
              <div className="rounded-lg border border-orange-700 bg-gradient-to-br from-orange-700 to-orange-800 p-2 shadow-md">
                <div className="flex items-center gap-1">
                  <Image
                    src="/vintage-gift-box-with-ribbon-in-sepia-tones.jpg"
                    alt="Cadou vintage"
                    width={24}
                    height={24}
                    className="rounded object-cover"
                    loading="lazy"
                  />
                  <span className="text-lg font-semibold tracking-[0.3px] text-white">Cadou</span>
                </div>
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1 px-6 pt-2">
          <h2 className="text-card-foreground mb-2 line-clamp-2 text-center text-lg font-semibold">
            {pkg.shortTitle || pkg.title}
          </h2>
          <p className="text-muted-foreground mb-4 line-clamp-3 text-justify text-sm leading-relaxed">
            {pkg.description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="px-6 pt-0 pb-6">
        <Link href={linkUrl} className="w-full">
          <Button
            className="w-full items-stretch justify-center text-center text-base font-semibold text-white shadow-md transition-colors hover:cursor-pointer"
            style={pkg.buttonColor ? buttonStyle : undefined}
            {...(!pkg.buttonColor && {
              className:
                "w-full bg-accent-orange hover:bg-accent-orange-dark text-white items-stretch hover:cursor-pointer text-base font-semibold text-center justify-center shadow-md transition-colors",
            })}
          >
            Vezi detalii
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
