import type { Product, PromoPackage } from "@/lib/types";
import type { ZenblogPost } from "@/lib/zenblog";
import { ORGANIZATION, SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

// Obiecte schema.org (JSON-LD). Organizația are un @id fix, așa că produsele și
// articolele o referă în loc să o repete.

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: ORGANIZATION.name,
    legalName: ORGANIZATION.legalName,
    description: ORGANIZATION.description,
    url: SITE_URL,
    logo: ORGANIZATION.logo,
    email: ORGANIZATION.email,
    telephone: ORGANIZATION.telephone,
    address: { "@type": "PostalAddress", ...ORGANIZATION.address },
    sameAs: ORGANIZATION.sameAs,
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    inLanguage: "ro-RO",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** Firul de navigare (Acasă › Produse › Hărți › …), afișat de Google sub titlu. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Produs sau pachet promo; oferta trimite la pagina de comandă de pe eMAG. */
export function productLd(item: Product | PromoPackage, path: string, category?: string) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: item.title,
    description: item.description,
    image: item.images.map((image) => image.url),
    sku: item.slug,
    url,
    ...(category ? { category } : {}),
    brand: { "@type": "Brand", name: SITE_NAME },
    manufacturer: { "@id": ORGANIZATION_ID },
    ...(item.priceNumeric > 0
      ? {
          offers: {
            "@type": "Offer",
            url: item.orderLink || url,
            price: item.priceNumeric.toFixed(2),
            priceCurrency: "RON",
            availability: item.availableSoon
              ? "https://schema.org/PreOrder"
              : "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@id": ORGANIZATION_ID },
          },
        }
      : {}),
  };
}

export function blogPostingLd(post: ZenblogPost) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: url,
    inLanguage: "ro-RO",
    datePublished: post.published_at,
    ...(post.cover_image ? { image: [post.cover_image] } : {}),
    author: (post.authors?.length ? post.authors : [{ name: SITE_NAME }]).map((author) => ({
      "@type": "Person",
      name: author.name,
    })),
    publisher: { "@id": ORGANIZATION_ID },
    ...(post.category ? { articleSection: post.category.name } : {}),
    ...(post.tags?.length ? { keywords: post.tags.map((tag) => tag.name).join(", ") } : {}),
  };
}
