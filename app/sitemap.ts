import type { MetadataRoute } from "next";
import { getProductsForSitemap } from "@/lib/sanity/products";
import { getPromosForSitemap } from "@/lib/sanity/promo";
import { absoluteUrl } from "@/lib/site";
import { zenblogApi } from "@/lib/zenblog";

// Lista tuturor paginilor pentru Google, regenerată cel mult o dată pe oră. Un produs
// publicat în Sanity sau un articol publicat în Zenblog apare aici fără nicio modificare
// de cod; Google recitește sitemap-ul periodic și vede `lastModified`.
export const revalidate = 3600;

const STATIC_PAGES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/produse", priority: 0.9 },
  { path: "/produse/harti", priority: 0.9 },
  { path: "/produse/vederi", priority: 0.8 },
  { path: "/produse/carti", priority: 0.8 },
  { path: "/promo", priority: 0.8 },
  { path: "/blog", priority: 0.7 },
  { path: "/despre", priority: 0.5 },
  { path: "/video", priority: 0.4 },
  { path: "/contact", priority: 0.4 },
];

const toImages = (images?: (string | null)[] | null) =>
  images?.filter((url): url is string => Boolean(url));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, promos, posts] = await Promise.all([
    getProductsForSitemap(),
    getPromosForSitemap(),
    zenblogApi.posts.listAll().catch(() => []),
  ]);

  const categories = new Map<string, string>();
  for (const post of posts) {
    if (post.category) categories.set(post.category.slug, post.published_at);
  }

  return [
    ...STATIC_PAGES.map(({ path, priority }) => ({ url: absoluteUrl(path), priority })),
    ...products
      .filter((product) => product.category)
      .map((product) => ({
        url: absoluteUrl(`/produse/${product.category}/${product.slug}`),
        lastModified: product.updatedAt,
        priority: 0.8,
        images: toImages(product.images),
      })),
    ...promos.map((promo) => ({
      url: absoluteUrl(`/promo/${promo.slug}`),
      lastModified: promo.updatedAt,
      priority: 0.7,
      images: toImages(promo.images),
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.published_at,
      priority: 0.6,
      ...(post.cover_image?.startsWith("http") ? { images: [post.cover_image] } : {}),
    })),
    ...[...categories].map(([slug, lastModified]) => ({
      url: absoluteUrl(`/blog/category/${slug}`),
      lastModified,
      priority: 0.4,
    })),
  ];
}
