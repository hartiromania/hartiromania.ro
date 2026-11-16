// --- Câmpurile comune proiectate din Sanity ---
// Imaginile sunt rezolvate direct la URL-ul CDN (asset->url).

const PRODUCT_FIELDS = `
  "slug": slug.current,
  category,
  title,
  shortTitle,
  description,
  longDescription,
  price,
  priceLabel,
  "images": images[]{ "url": asset->url, alt },
  "thumbnail": thumbnail.asset->url,
  specifications[]{ label, value },
  storyTitle,
  story,
  orderLink,
  orderButtonText,
  buttonColor,
  featured, isNew, isBestSeller, availableSoon,
  sortOrder,
  hasGift,
  giftProduct{ title, description, "images": images[]{ "url": asset->url, alt }, link }
`;

const PROMO_FIELDS = `
  "slug": slug.current,
  title,
  shortTitle,
  description,
  longDescription,
  price,
  priceLabel,
  "images": images[]{ "url": asset->url, alt },
  "thumbnail": thumbnail.asset->url,
  specifications[]{ label, value },
  storyTitle,
  story,
  orderLink,
  orderButtonText,
  buttonColor,
  isNew, isBestSeller, availableSoon,
  hasGift,
  giftProduct{ title, description, "images": images[]{ "url": asset->url, alt }, link }
`;

export const ALL_PRODUCTS_QUERY = `*[_type == "product"]{${PRODUCT_FIELDS}}`;
export const PRODUCT_BY_SLUG_QUERY = `*[_type == "product" && slug.current == $slug][0]{${PRODUCT_FIELDS}}`;
export const PRODUCTS_BY_CATEGORY_QUERY = `*[_type == "product" && category == $category]{${PRODUCT_FIELDS}}`;
export const FEATURED_PRODUCTS_QUERY = `*[_type == "product" && featured == true]{${PRODUCT_FIELDS}}`;
export const PRODUCT_SLUGS_QUERY = `*[_type == "product" && defined(slug.current)]{ "slug": slug.current, category }`;

export const ALL_PROMO_QUERY = `*[_type == "promoPackage"]{${PROMO_FIELDS}}`;
export const PROMO_BY_SLUG_QUERY = `*[_type == "promoPackage" && slug.current == $slug][0]{${PROMO_FIELDS}}`;
export const PROMO_SLUGS_QUERY = `*[_type == "promoPackage" && defined(slug.current)]{ "slug": slug.current }`;

// Pentru sitemap: adresa, data ultimei modificări și pozele (sitemap de imagini).
export const SITEMAP_PRODUCTS_QUERY = `*[_type == "product" && defined(slug.current)]{ "slug": slug.current, category, "updatedAt": _updatedAt, "images": images[].asset->url }`;
export const SITEMAP_PROMO_QUERY = `*[_type == "promoPackage" && defined(slug.current)]{ "slug": slug.current, "updatedAt": _updatedAt, "images": images[].asset->url }`;
