// Datele de identitate ale site-ului, folosite de metadate, sitemap, robots,
// llms.txt, datele structurate (JSON-LD) și RSS. Un singur loc de modificat.

// Adresa canonică: varianta cu www (domeniul fără www redirecționează aici).
export const SITE_URL = "https://www.hartiromania.ro";

export const SITE_NAME = "Hărți România";

export const SITE_DESCRIPTION =
  "Hărți istorice ale României, de la Dacia la România Mare, vederi cu domnitori și cărți de colecție. Hărți vechi restaurate digital, din Râșnov.";

export const ORGANIZATION = {
  name: SITE_NAME,
  legalName: "Hărți România",
  description:
    "Hărți istorice ale României și ale lumii restaurate digital, vederi și cărți de colecție, din Râșnov, județul Brașov.",
  email: "contact@hartiromania.ro",
  telephone: "+40 756 705 633",
  logo: `${SITE_URL}/logo-principal-no-bg-cropped.png`,
  address: {
    streetAddress: "Str. Nicolae Bălcescu",
    addressLocality: "Râșnov",
    addressRegion: "Brașov",
    addressCountry: "RO",
  },
  // Profilurile oficiale; motoarele de căutare le leagă de aceeași entitate.
  sameAs: [
    "https://www.facebook.com/profile.php?id=61580871537631",
    "https://www.instagram.com/hartiromania/",
    "https://x.com/HartiRomania",
    "https://t.me/hartiromania",
  ],
} as const;

export const TWITTER_HANDLE = "@HartiRomania";

/** Adresa absolută pentru o cale internă („/produse/harti” → „https://www…/produse/harti”). */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

/** Scurtează un text la o lungime potrivită pentru meta description, fără să taie cuvinte. */
export function toMetaDescription(text: string | undefined, max = 155): string | undefined {
  if (!text) return undefined;
  const plain = text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}
