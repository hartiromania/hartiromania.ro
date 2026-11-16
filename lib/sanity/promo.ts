import "server-only";
import { client } from "@/sanity/lib/client";
import type { PromoPackage } from "@/lib/types";
import { transformPromo, type RawPromo } from "./transform";
import {
  ALL_PROMO_QUERY,
  PROMO_BY_SLUG_QUERY,
  PROMO_SLUGS_QUERY,
  SITEMAP_PROMO_QUERY,
} from "./queries";
import type { SitemapEntry } from "./products";

async function safeFetch<T>(
  query: string,
  params: Record<string, unknown>,
  fallback: T,
): Promise<T> {
  try {
    const result = await client.fetch<T>(query, params);
    return result ?? fallback;
  } catch (err) {
    console.error("[sanity] fetch eșuat:", err);
    return fallback;
  }
}

export async function getAllPromoPackages(): Promise<PromoPackage[]> {
  const raw = await safeFetch<RawPromo[]>(ALL_PROMO_QUERY, {}, []);
  return raw.map(transformPromo);
}

export async function getPromoPackageBySlug(slug: string): Promise<PromoPackage | undefined> {
  const raw = await safeFetch<RawPromo | null>(PROMO_BY_SLUG_QUERY, { slug }, null);
  return raw ? transformPromo(raw) : undefined;
}

export async function getPromoSlugs(): Promise<{ slug: string }[]> {
  return safeFetch<{ slug: string }[]>(PROMO_SLUGS_QUERY, {}, []);
}

export async function getPromosForSitemap(): Promise<SitemapEntry[]> {
  return safeFetch<SitemapEntry[]>(SITEMAP_PROMO_QUERY, {}, []);
}
