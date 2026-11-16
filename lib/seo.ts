import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, TWITTER_HANDLE, absoluteUrl } from "@/lib/site";

// Cardul generat de app/opengraph-image.tsx. Îl declarăm explicit: o pagină care își
// definește `openGraph` nu mai moștenește imaginea din fișierul de la rădăcină.
const BRAND_CARD = [
  {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: `${SITE_NAME}: hărți istorice, vederi și cărți de colecție`,
  },
];

interface PageMetadataInput {
  /** Titlul paginii; i se adaugă „ | Hărți România”. */
  title: string;
  /**
   * Titlul complet, folosit ca atare. Necesar pe pagina principală: șablonul de titlu
   * din layout se aplică doar paginilor de sub el, nu și celei de la același nivel.
   */
  absoluteTitle?: string;
  description?: string;
  /** Calea canonică, ex. „/produse/harti”. */
  path: string;
  /** Imagini de share; fără ele se folosește cardul generat al site-ului. */
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
  noindex?: boolean;
}

/**
 * Metadatele complete ale unei pagini: titlu, descriere, adresă canonică și etichetele
 * Open Graph / Twitter pentru share. Next nu copiază singur titlul în og:title, iar un
 * obiect `openGraph` declarat în pagină îl înlocuiește complet pe cel din layout, așa că
 * fiecare pagină primește setul întreg de aici.
 */
export function pageMetadata(input: PageMetadataInput): Metadata {
  const fullTitle = input.absoluteTitle ?? `${input.title} | ${SITE_NAME}`;
  const images = input.images ?? BRAND_CARD;
  return {
    title: input.absoluteTitle ? { absolute: input.absoluteTitle } : input.title,
    description: input.description,
    alternates: {
      canonical: input.path,
      types: { "application/rss+xml": `${SITE_URL}/blog/rss.xml` },
    },
    openGraph: {
      type: input.type ?? "website",
      locale: "ro_RO",
      siteName: SITE_NAME,
      url: absoluteUrl(input.path),
      title: fullTitle,
      description: input.description,
      images,
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.authors ? { authors: input.authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      title: fullTitle,
      description: input.description,
      images: images.map((image) => image.url),
    },
    ...(input.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/**
 * Imaginea de share pentru o fotografie din Sanity: 1200×630, cu toată harta vizibilă
 * (fit=fill), iar spațiul rămas umplut cu culoarea de pergament a site-ului.
 */
export function sanityShareImage(url: string | undefined, alt: string) {
  if (!url || !url.startsWith("https://cdn.sanity.io/")) return undefined;
  const params = new URLSearchParams({
    w: "1200",
    h: "630",
    fit: "fill",
    bg: "f5f1e8",
    fm: "jpg",
    q: "85",
  });
  return [{ url: `${url}?${params}`, width: 1200, height: 630, alt }];
}
