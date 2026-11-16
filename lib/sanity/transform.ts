import type { Product, PromoPackage, ProductImage, ProductSpecification } from "@/lib/types";
import { storyToHtml, type PortableTextInput } from "./portable-text-to-html";

// Tip brut, așa cum vine din Sanity (după proiecția GROQ).
interface RawImage {
  url?: string | null;
  alt?: string | null;
}

interface RawGift {
  title?: string;
  description?: string;
  images?: RawImage[];
  link?: string;
}

export interface RawPromo {
  slug?: string;
  title?: string;
  shortTitle?: string;
  description?: string;
  longDescription?: string;
  price?: number;
  priceLabel?: string;
  images?: RawImage[];
  thumbnail?: string | null;
  specifications?: ProductSpecification[];
  storyTitle?: string;
  story?: PortableTextInput | null;
  orderLink?: string;
  orderButtonText?: string;
  buttonColor?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  availableSoon?: boolean;
  hasGift?: boolean;
  giftProduct?: RawGift;
}

export interface RawProduct extends RawPromo {
  category?: "harti" | "vederi" | "carti";
  featured?: boolean;
  sortOrder?: number;
}

// „49,61 RON" din 49.61 — format românesc, virgulă, 2 zecimale.
function formatPrice(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return `${value.toFixed(2).replace(".", ",")} RON`;
}

function mapImages(images: RawImage[] | undefined, fallbackAlt: string): ProductImage[] {
  if (!images) return [];
  return images
    .filter((img) => img?.url)
    .map((img) => ({ url: img.url as string, alt: img.alt || fallbackAlt }));
}

function mapGift(gift: RawGift | undefined, fallbackAlt: string) {
  if (!gift) return undefined;
  return {
    title: gift.title || "",
    description: gift.description || "",
    images: mapImages(gift.images, fallbackAlt),
    link: gift.link || "",
  };
}

export function transformProduct(raw: RawProduct): Product {
  const title = raw.title || "";
  const images = mapImages(raw.images, title);
  return {
    id: raw.slug || "",
    slug: raw.slug || "",
    category: raw.category || "harti",
    title,
    shortTitle: raw.shortTitle,
    description: raw.description || "",
    longDescription: raw.longDescription,
    price: raw.priceLabel || formatPrice(raw.price),
    priceNumeric: typeof raw.price === "number" ? raw.price : 0,
    images,
    thumbnailImage: raw.thumbnail || images[0]?.url || "",
    specifications: raw.specifications || [],
    storyTitle: raw.storyTitle,
    storyContent: storyToHtml(raw.story),
    orderLink: raw.orderLink,
    orderButtonText: raw.orderButtonText || "Comandă",
    availableSoon: raw.availableSoon,
    featured: raw.featured,
    buttonColor: raw.buttonColor,
    hasGift: raw.hasGift,
    isBestSeller: raw.isBestSeller,
    isNew: raw.isNew,
    sortOrder: raw.sortOrder,
    giftProduct: raw.hasGift ? mapGift(raw.giftProduct, title) : undefined,
  };
}

export function transformPromo(raw: RawPromo): PromoPackage {
  const title = raw.title || "";
  const images = mapImages(raw.images, title);
  return {
    id: raw.slug || "",
    slug: raw.slug || "",
    title,
    shortTitle: raw.shortTitle,
    description: raw.description || "",
    longDescription: raw.longDescription,
    price: raw.priceLabel || formatPrice(raw.price),
    priceNumeric: typeof raw.price === "number" ? raw.price : 0,
    images,
    thumbnailImage: raw.thumbnail || images[0]?.url || "",
    specifications: raw.specifications || [],
    storyTitle: raw.storyTitle,
    storyContent: storyToHtml(raw.story),
    orderLink: raw.orderLink,
    orderButtonText: raw.orderButtonText || "Comandă",
    buttonColor: raw.buttonColor,
    availableSoon: raw.availableSoon,
    hasGift: raw.hasGift,
    isBestSeller: raw.isBestSeller,
    isNew: raw.isNew,
    giftProduct: raw.hasGift ? mapGift(raw.giftProduct, title) : undefined,
  };
}
